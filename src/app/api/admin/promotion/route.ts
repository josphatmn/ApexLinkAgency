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

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const rounds = await query<RowDataPacket[]>(
    `SELECT pr.*, u.username FROM promotion_rounds pr LEFT JOIN users u ON pr.winner_id=u.id ORDER BY pr.id DESC LIMIT 30`
  );

  const bets = await query<RowDataPacket[]>(
    `SELECT pb.*, u.username FROM promotion_bets pb JOIN users u ON pb.user_id=u.id ORDER BY pb.created_at DESC LIMIT 100`
  );

  return NextResponse.json({ success: true, rounds, bets });
}
