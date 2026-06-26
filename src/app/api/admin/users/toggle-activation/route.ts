import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });

    const users = await query<RowDataPacket[]>('SELECT id, activated FROM users WHERE id = ?', [user_id]);
    if (!users.length) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const user = users[0] as any;
    const newStatus = user.activated ? 0 : 1;

    await execute('UPDATE users SET activated = ?, activated_at = IF(? = 1, NOW(), activated_at) WHERE id = ?', [
      newStatus, newStatus, user_id,
    ]);

    return NextResponse.json({ success: true, activated: !!newStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to toggle' }, { status: 500 });
  }
}
