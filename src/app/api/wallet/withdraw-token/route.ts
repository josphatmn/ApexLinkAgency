import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const { amount } = await req.json();
  const amt = parseInt(amount);
  if (!amt || amt <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
  }

  const exchangeRate = parseFloat(process.env.TOKEN_EXCHANGE_RATE || '1');
  const cashValue = amt * exchangeRate;

  const users = await query<RowDataPacket[]>(
    'SELECT apex_balance FROM users WHERE id = ?',
    [session.userId]
  );
  if (users.length === 0) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const tokenBalance = parseFloat((users[0] as any).apex_balance);
  if (tokenBalance < amt) {
    return NextResponse.json({ success: false, error: 'Insufficient token balance' }, { status: 400 });
  }

  await execute(
    'UPDATE users SET apex_balance = apex_balance - ?, balance = balance + ? WHERE id = ?',
    [amt, cashValue, session.userId]
  );

  return NextResponse.json({ success: true, balance: cashValue });
}

export const dynamic = 'force-dynamic';
