import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { fullname, email, bio } = await req.json();
  await execute('UPDATE users SET fullname = ?, email = ?, bio = ? WHERE id = ?', [fullname || '', email || '', bio || '', session.userId]);
  return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
}
