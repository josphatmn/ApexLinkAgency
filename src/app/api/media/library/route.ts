import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-utils';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const rows = await query<RowDataPacket[]>(
    'SELECT id, media_id, media_type, title, poster_path, cost, created_at FROM media_access WHERE user_id = ? ORDER BY created_at DESC',
    [session.userId]
  );

  return NextResponse.json({ success: true, items: rows });
}

export const dynamic = 'force-dynamic';
