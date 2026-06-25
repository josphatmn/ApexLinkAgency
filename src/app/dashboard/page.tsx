import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { config } from '@/lib/config';
import { formatMoney } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';
import DashboardClient from './client';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.activated) redirect('/payment');

  const users = await query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [session.userId]);
  const user = users[0] as any;
  if (!user) redirect('/login');

  const l1 = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM users WHERE referred_by = ?', [session.userId]);
  const level1Count = l1[0].count;

  const l2 = await query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM users WHERE referred_by IN (SELECT id FROM users WHERE referred_by = ?)',
    [session.userId]
  );
  const level2Count = l2[0].count;

  const comms = await query<RowDataPacket[]>(
    `SELECT c.*, u.username as from_username FROM commissions c JOIN users u ON c.from_user_id = u.id WHERE c.user_id = ? ORDER BY c.created_at DESC LIMIT 10`,
    [session.userId]
  );

  const paidOut = await query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'withdrawal' AND status IN ('pending', 'completed')",
    [session.userId]
  );

  const balance = parseFloat(user.balance);
  const threshold = config.withdrawalThreshold;
  const progressPercent = Math.min(100, (balance / threshold) * 100);
  const canWithdraw = balance >= threshold;

  return (
    <DashboardClient
      user={user}
      level1Count={level1Count}
      level2Count={level2Count}
      commissions={comms as any[]}
      totalPaidOut={parseFloat(paidOut[0].total)}
      progressPercent={progressPercent}
      canWithdraw={canWithdraw}
      threshold={threshold}
    />
  );
}

export const dynamic = 'force-dynamic';
