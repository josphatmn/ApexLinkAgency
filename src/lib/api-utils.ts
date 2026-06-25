import { NextResponse } from 'next/server';
import { getSession } from './auth';

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  return session;
}

export async function requireActivated() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  if (!session.activated) {
    return NextResponse.json({ success: false, error: 'Account not activated' }, { status: 403 });
  }
  return session;
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiSuccess(data: Record<string, unknown> = {}) {
  return NextResponse.json({ success: true, ...data });
}
