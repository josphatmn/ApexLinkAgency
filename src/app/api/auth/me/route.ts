import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const users = await query<RowDataPacket[]>(
    'SELECT id, username, avatar, activated, balance, apex_balance FROM users WHERE id = ?',
    [session.userId]
  );

  if (users.length === 0) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const user = users[0] as any;
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      activated: Boolean(user.activated),
      balance: parseFloat(user.balance),
      apex_balance: parseFloat(user.apex_balance || 0),
    },
  });
}

export const dynamic = 'force-dynamic';
