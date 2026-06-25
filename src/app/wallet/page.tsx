import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { config } from '@/lib/config';
import WalletClient from './client';

export default async function WalletPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!session.activated) redirect('/payment');

  const users = await query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [session.userId]);
  const user = users[0] as any;
  if (!user) redirect('/login');

  const txns = await query<RowDataPacket[]>(
    "SELECT * FROM transactions WHERE user_id = ? AND type IN ('transfer', 'deposit') ORDER BY created_at DESC LIMIT 10",
    [session.userId]
  );

  return (
    <WalletClient
      balance={parseFloat(user.balance)}
      apexBalance={parseFloat(user.apex_balance)}
      transactions={txns as any[]}
      conversionRate={config.apexConversionRate}
      tokenName={config.tokenName}
    />
  );
}

export const dynamic = 'force-dynamic';
