import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { config } from '@/lib/config';
import { formatMoney } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  if (!session.activated) return NextResponse.json({ success: false, error: 'Account not activated' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('p') || '1');
  const level = searchParams.get('level') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const perPage = 20;

  let where = 'WHERE c.user_id = ?';
  const params: any[] = [session.userId];

  if (level === '1' || level === '2') {
    where += ' AND c.level = ?';
    params.push(parseInt(level));
  }
  if (dateFrom) {
    where += ' AND c.created_at >= ?';
    params.push(dateFrom + ' 00:00:00');
  }
  if (dateTo) {
    where += ' AND c.created_at <= ?';
    params.push(dateTo + ' 23:59:59');
  }

  const countResult = await query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM commissions c ${where}`, params);
  const total = countResult[0].total;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const offset = (page - 1) * perPage;

  const commissions = await query<RowDataPacket[]>(
    `SELECT c.*, u.username as from_username FROM commissions c JOIN users u ON c.from_user_id = u.id ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  const levelTotals = await query<RowDataPacket[]>(
    'SELECT level, COUNT(*) as count, SUM(amount) as total FROM commissions WHERE user_id = ? GROUP BY level',
    [session.userId]
  );

  return NextResponse.json({
    success: true,
    commissions,
    total,
    totalPages,
    page,
    levelTotals,
  });
}

export const dynamic = 'force-dynamic';
