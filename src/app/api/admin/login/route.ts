import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth';
import { config } from '@/lib/config';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username === (process.env.ADMIN_USERNAME || 'admin')) {
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const valid = password === adminPass;

    if (valid) {
      const token = await createToken({ userId: 0, username: 'admin', activated: true, isAdmin: true });
      const cookieStore = await cookies();
      cookieStore.set('admin_session', token, {
        httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/',
      });
      return Response.json({ success: true });
    }
  }

  return Response.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
