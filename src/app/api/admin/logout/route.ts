import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', { httpOnly: true, maxAge: 0, path: '/' });
  return NextResponse.json({ success: true });
}
