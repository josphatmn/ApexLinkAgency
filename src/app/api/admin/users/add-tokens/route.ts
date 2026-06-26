import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.isAdmin ? payload : null;
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { user_id, tokens } = await req.json();
    const tokenAmount = parseInt(tokens);

    if (!user_id) return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });
    if (!tokenAmount || tokenAmount < 1) return NextResponse.json({ success: false, error: 'Invalid token amount' }, { status: 400 });

    const users = await query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [user_id]);
    if (!users.length) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const ref = 'ADM-' + randomHex(6).toUpperCase();

    await execute('UPDATE users SET apex_balance = apex_balance + ? WHERE id = ?', [tokenAmount, user_id]);
    await execute(
      "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'deposit', ?, ?, 'completed', NOW())",
      [user_id, tokenAmount / config.apexConversionRate, ref],
    );

    return NextResponse.json({ success: true, message: `Added ${tokenAmount.toLocaleString()} ${config.tokenName} to user` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to add tokens' }, { status: 500 });
  }
}
