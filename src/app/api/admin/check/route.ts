import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return NextResponse.json({ success: false }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.isAdmin) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json({ success: true });
}
