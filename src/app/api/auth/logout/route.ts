import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function GET() {
  await clearSession();
  return NextResponse.json({ success: true });
}

export const dynamic = 'force-dynamic';
