import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  try {
    const { orderTrackingId, merchantReference } = await req.json();
    if (!orderTrackingId && !merchantReference) {
      return NextResponse.json({ success: false, error: 'Missing reference' }, { status: 400 });
    }

    let deposits: RowDataPacket[];
    if (merchantReference) {
      deposits = await query<RowDataPacket[]>(
        'SELECT * FROM pending_deposits WHERE merchant_reference = ? AND user_id = ? LIMIT 1',
        [merchantReference, session.userId],
      );
    } else {
      deposits = await query<RowDataPacket[]>(
        'SELECT * FROM pending_deposits WHERE order_tracking_id = ? AND user_id = ? LIMIT 1',
        [orderTrackingId, session.userId],
      );
    }

    const deposit = deposits[0] as any;
    if (!deposit) {
      return NextResponse.json({ success: false, error: 'Deposit record not found' }, { status: 404 });
    }

    if (deposit.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Deposit already completed.' });
    }

    const amount = parseFloat(deposit.amount);
    const apexAmount = Math.round(amount * config.apexConversionRate);

    await execute('UPDATE users SET balance = balance + ?, apex_balance = apex_balance + ? WHERE id = ?', [
      amount, apexAmount, session.userId,
    ]);

    await execute(
      "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'deposit', ?, ?, 'completed', NOW())",
      [session.userId, amount, 'DEP-' + randomHex(6).toUpperCase()],
    );

    await execute(
      "UPDATE pending_deposits SET status = 'completed' WHERE id = ?",
      [deposit.id],
    );

    return NextResponse.json({
      success: true,
      message: `Deposited ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${config.currencySymbol}. Added ${apexAmount.toLocaleString()} ${config.tokenName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Verification failed' }, { status: 500 });
  }
}
