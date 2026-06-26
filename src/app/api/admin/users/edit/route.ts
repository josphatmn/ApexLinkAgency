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
    const { user_id, fullname, email, phone, activated, add_balance } = await req.json();
    if (!user_id) return NextResponse.json({ success: false, error: 'Missing user_id' }, { status: 400 });

    const users = await query<RowDataPacket[]>('SELECT id, activated FROM users WHERE id = ?', [user_id]);
    if (!users.length) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const user = users[0] as any;

    const updates: string[] = [];
    const params: any[] = [];

    if (fullname !== undefined) { updates.push('fullname = ?'); params.push(fullname ?? null); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email ?? null); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone ?? null); }

    if (activated !== undefined && activated !== user.activated) {
      const val = activated ? 1 : 0;
      updates.push('activated = ?');
      params.push(val);
      if (val) updates.push('activated_at = NOW()');
    }

    const balanceToAdd = parseFloat(add_balance);
    if (!isNaN(balanceToAdd) && balanceToAdd > 0) {
      updates.push('balance = balance + ?');
      params.push(balanceToAdd);
    }

    if (!updates.length) return NextResponse.json({ success: true, message: 'No changes' });

    params.push(user_id);
    await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    if (!isNaN(balanceToAdd) && balanceToAdd > 0) {
      const ref = 'ADM-BAL-' + randomHex(6).toUpperCase();
      await execute(
        "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'deposit', ?, ?, 'completed', NOW())",
        [user_id, balanceToAdd, ref],
      );
      const apexAmount = Math.round(balanceToAdd * config.apexConversionRate);
      await execute('UPDATE users SET apex_balance = apex_balance + ? WHERE id = ?', [apexAmount, user_id]);
    }

    return NextResponse.json({ success: true, message: 'User updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update user' }, { status: 500 });
  }
}
