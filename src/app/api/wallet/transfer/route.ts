import { NextRequest, NextResponse } from 'next/server';
import { execute, query, getConnection } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  if (!session.activated) return NextResponse.json({ success: false, error: 'Account not activated' }, { status: 403 });

  const { amount } = await req.json();
  const amt = parseFloat(amount);
  if (amt <= 0) return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });

  const users = await query<RowDataPacket[]>('SELECT balance, apex_balance FROM users WHERE id = ?', [session.userId]);
  if (users.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  const balance = parseFloat((users[0] as any).balance);
  if (amt > balance) return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });

  const tokens = amt * config.apexConversionRate;

  try {
    const conn = await getConnection();
    await conn.beginTransaction();
    await conn.execute('UPDATE users SET balance = balance - ?, apex_balance = apex_balance + ? WHERE id = ?', [amt, tokens, session.userId]);
    await conn.execute(
      "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'transfer', ?, ?, 'completed', NOW())",
      [session.userId, amt, 'WALLET-' + randomHex(4).toUpperCase()]
    );
    await conn.commit();
    conn.release();
    return NextResponse.json({ success: true, message: `${Math.round(tokens).toLocaleString()} ${config.tokenName} tokens added to your wallet.` });
  } catch {
    return NextResponse.json({ success: false, error: 'Transfer failed' }, { status: 500 });
  }
}
