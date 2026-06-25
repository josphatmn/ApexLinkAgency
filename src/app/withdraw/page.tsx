import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { config } from '@/lib/config';
import WithdrawClient from './client';

export default async function WithdrawPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.activated) redirect('/payment');

  const users = await query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [session.userId]);
  const user = users[0] as any;
  if (!user) redirect('/login');

  const withdrawals = await query<RowDataPacket[]>(
    "SELECT * FROM transactions WHERE user_id = ? AND type = 'withdrawal' ORDER BY created_at DESC LIMIT 10",
    [session.userId]
  );

  const totalResult = await query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'withdrawal' AND status IN ('pending', 'completed')",
    [session.userId]
  );

  return (
    <WithdrawClient
      balance={parseFloat(user.balance)}
      apexBalance={parseFloat(user.apex_balance)}
      withdrawals={withdrawals as any[]}
      totalWithdrawn={parseFloat(totalResult[0].total)}
      threshold={config.withdrawalThreshold}
    />
  );
}

export const dynamic = 'force-dynamic';
