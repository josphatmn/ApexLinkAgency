import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';

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
  const srcFilter = url.searchParams.get('source') || '';
  const dateFrom = url.searchParams.get('date_from') || '';
  const dateTo = url.searchParams.get('date_to') || '';
  const pageNum = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const perPage = config.incomePerPage;

  const where: string[] = [];
  const params: any[] = [];

  if (srcFilter) { where.push('source=?'); params.push(srcFilter); }
  if (dateFrom) { where.push('DATE(created_at)>=?'); params.push(dateFrom); }
  if (dateTo) { where.push('DATE(created_at)<=?'); params.push(dateTo); }
  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countResult = await query<RowDataPacket[]>(`SELECT COUNT(*) as c FROM platform_income ${whereClause}`, params);
  const total = countResult[0].c;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const offset = (pageNum - 1) * perPage;

  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM platform_income ${whereClause} ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
    params
  );

  const totalsResult = await query<RowDataPacket[]>(
    `SELECT source, COALESCE(SUM(amount),0) as total FROM platform_income ${whereClause} GROUP BY source`,
    params
  );

  const totals: Record<string, number> = {};
  for (const r of totalsResult) {
    totals[r.source] = parseFloat(r.total);
  }

  const distinctSources = await query<RowDataPacket[]>(
    'SELECT DISTINCT source FROM platform_income ORDER BY source'
  );

  return NextResponse.json({
    success: true,
    entries: rows,
    total,
    totalPages,
    perPage,
    page: pageNum,
    totals,
    sources: distinctSources.map(r => r.source),
  });
}

export const dynamic = 'force-dynamic';
