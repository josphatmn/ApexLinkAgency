import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

export async function GET(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get('search') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('p') || '1'));
  const perPage = 25;

  let where = '';
  const params: any[] = [];
  if (search) {
    where = 'WHERE u.username LIKE ? OR u.fullname LIKE ? OR u.email LIKE ? OR u.phone LIKE ?';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const countResult = await query<RowDataPacket[]>(`SELECT COUNT(*) as c FROM users u ${where}`, params);
  const total = countResult[0].c;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const offset = (page - 1) * perPage;

  const users = await query<RowDataPacket[]>(
    `SELECT u.*, (SELECT COUNT(*) FROM users r WHERE r.referred_by=u.id) as referrals FROM users u ${where} ORDER BY u.created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
    params
  );

  return NextResponse.json({ success: true, users, total, page, lastPage });
}

export const dynamic = 'force-dynamic';
