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

  const totalUsers = (await query<RowDataPacket[]>('SELECT COUNT(*) as c FROM users'))[0].c;
  const activatedUsers = (await query<RowDataPacket[]>("SELECT COUNT(*) as c FROM users WHERE activated=1"))[0].c;
  const totalCommissions = (await query<RowDataPacket[]>('SELECT COALESCE(SUM(amount),0) as t FROM commissions'))[0].t;
  const totalPaid = (await query<RowDataPacket[]>("SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='withdrawal' AND status='completed'"))[0].t;
  const pendingWithdrawals = (await query<RowDataPacket[]>("SELECT COUNT(*) as c FROM transactions WHERE type='withdrawal' AND status='pending'"))[0].c;
  const platformIncome = (await query<RowDataPacket[]>('SELECT COALESCE(SUM(amount),0) as t FROM platform_income'))[0].t;
  const promoPot = (await query<RowDataPacket[]>("SELECT COALESCE(SUM(total_pot),0) as t FROM promotion_rounds WHERE status='open'"))[0].t;

  const incomeBySource = await query<RowDataPacket[]>('SELECT source, COALESCE(SUM(amount),0) as total FROM platform_income GROUP BY source');

  return NextResponse.json({
    success: true,
    stats: { totalUsers, activatedUsers, totalCommissions, totalPaid, pendingWithdrawals, platformIncome, promoPot },
    incomeBySource,
  });
}

export const dynamic = 'force-dynamic';
