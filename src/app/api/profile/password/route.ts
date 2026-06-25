import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { current_password, new_password, confirm_password } = await req.json();

  if (!current_password || !new_password || !confirm_password) {
    return NextResponse.json({ success: false, error: 'All password fields are required' }, { status: 400 });
  }
  if (new_password !== confirm_password) {
    return NextResponse.json({ success: false, error: 'New passwords do not match' }, { status: 400 });
  }
  if (new_password.length < 6) {
    return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const users = await query<RowDataPacket[]>('SELECT password FROM users WHERE id = ?', [session.userId]);
  if (users.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  if (!(await bcrypt.compare(current_password, users[0].password))) {
    return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(new_password, 12);
  await execute('UPDATE users SET password = ? WHERE id = ?', [hashed, session.userId]);

  return NextResponse.json({ success: true, message: 'Password changed successfully.' });
}
