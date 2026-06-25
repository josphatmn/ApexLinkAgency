import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  if (!session.activated) return NextResponse.json({ success: false, error: 'Account not activated' }, { status: 403 });

  const activeRound = await query<RowDataPacket[]>(
    "SELECT * FROM promotion_rounds WHERE status='open' ORDER BY id DESC LIMIT 1"
  );

  const completed = await query<RowDataPacket[]>(
    `SELECT pr.*, u.username FROM promotion_rounds pr LEFT JOIN users u ON pr.winner_id=u.id WHERE pr.status='completed' ORDER BY pr.ended_at DESC LIMIT 20`
  );

  let bets: any[] = [];
  if (activeRound.length > 0) {
    bets = await query<RowDataPacket[]>(
      `SELECT pb.*, u.username FROM promotion_bets pb JOIN users u ON pb.user_id=u.id WHERE pb.round_id=? ORDER BY pb.created_at DESC`,
      [activeRound[0].id]
    );
  }

  return NextResponse.json({
    success: true,
    activeRound: activeRound[0] || null,
    completed,
    bets,
    config: {
      intervalMinutes: config.promotionIntervalMinutes,
      winnerPercentage: config.promotionWinnerPercentage,
      tokenName: config.tokenName,
    },
  });
}

export const dynamic = 'force-dynamic';
