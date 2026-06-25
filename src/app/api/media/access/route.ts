import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-utils';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const media_id = searchParams.get('media_id');
  const media_type = searchParams.get('media_type');

  if (!media_id || !media_type) {
    return NextResponse.json({ success: false, error: 'Missing media_id or media_type' }, { status: 400 });
  }

  const rows = await query<any[]>(
    'SELECT id, title, poster_path, cost, created_at FROM media_access WHERE user_id = ? AND media_id = ? AND media_type = ?',
    [session.userId, parseInt(media_id), media_type]
  );

  return NextResponse.json({
    success: true,
    hasAccess: rows.length > 0,
    access: rows[0] || null,
  });
}
