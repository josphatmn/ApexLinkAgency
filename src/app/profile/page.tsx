import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import ProfileClient from './client';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const users = await query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [session.userId]);
  const user = users[0] as any;
  if (!user) redirect('/login');

  return <ProfileClient user={user} />;
}

export const dynamic = 'force-dynamic';
