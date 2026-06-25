import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
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

  const tokens = amt * config.apexConversionRate;

  try {
    await execute('UPDATE users SET apex_balance = apex_balance + ? WHERE id = ?', [tokens, session.userId]);
    await execute(
      "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'deposit', ?, ?, 'completed', NOW())",
      [session.userId, amt, 'DEP-' + randomHex(4).toUpperCase()]
    );
    return NextResponse.json({ success: true, message: `${Math.round(tokens).toLocaleString()} ${config.tokenName} tokens deposited to your wallet.` });
  } catch {
    return NextResponse.json({ success: false, error: 'Deposit failed' }, { status: 500 });
  }
}
