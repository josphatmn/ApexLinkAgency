import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { formatMoney, randomHex } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  if (!session.activated) return NextResponse.json({ success: false, error: 'Account not activated' }, { status: 403 });

  const { amount } = await req.json();
  const requestedAmount = parseFloat(amount);
  if (!requestedAmount || requestedAmount <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid withdrawal amount' }, { status: 400 });
  }

  const users = await query<RowDataPacket[]>('SELECT balance FROM users WHERE id = ?', [session.userId]);
  if (users.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  const balance = parseFloat((users[0] as any).balance);
  if (requestedAmount > balance) {
    return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
  }
  if (requestedAmount < config.withdrawalThreshold) {
    return NextResponse.json({ success: false, error: `Minimum withdrawal is ${formatMoney(config.withdrawalThreshold)}` }, { status: 400 });
  }

  try {
    const conn = await (await import('@/lib/db')).getConnection();
    await conn.beginTransaction();

    const fee = requestedAmount * config.withdrawalFeePercentage;
    const netAmount = requestedAmount - fee;
    const ref = 'WTHD-' + randomHex(4).toUpperCase();

    await conn.execute(
      "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'withdrawal', ?, ?, 'pending', NOW())",
      [session.userId, netAmount, ref]
    );
    await conn.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [requestedAmount, session.userId]);
    await conn.execute(
      "INSERT INTO platform_income (source, amount, reference, created_at) VALUES ('withdrawal_fee', ?, ?, NOW())",
      [fee, ref]
    );

    await conn.commit();
    conn.release();
    return NextResponse.json({ success: true, message: `Withdrawal of ${formatMoney(netAmount)} requested. ${formatMoney(fee)} management fee applied.` });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process withdrawal request' }, { status: 500 });
  }
}
