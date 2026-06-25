import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.isAdmin ? payload : null;
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const activeRound = await query<RowDataPacket[]>("SELECT * FROM promotion_rounds WHERE status='open' ORDER BY id DESC LIMIT 1");

  const completed = await query<RowDataPacket[]>(
    "SELECT pr.*, u.username FROM promotion_rounds pr LEFT JOIN users u ON pr.winner_id=u.id WHERE pr.status='completed' ORDER BY pr.ended_at DESC LIMIT 20"
  );

  const allRounds = await query<RowDataPacket[]>("SELECT * FROM promotion_rounds ORDER BY id DESC LIMIT 30");

  const allBets = await query<RowDataPacket[]>(
    "SELECT pb.*, u.username FROM promotion_bets pb JOIN users u ON pb.user_id=u.id ORDER BY pb.created_at DESC LIMIT 100"
  );

  return NextResponse.json({ success: true, activeRound: activeRound[0] || null, completed, allRounds, allBets });
}

export async function POST(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const interval = config.promotionIntervalMinutes * 60;
  const expiredRounds = await query<RowDataPacket[]>(
    "SELECT * FROM promotion_rounds WHERE status = 'open' AND TIMESTAMPDIFF(SECOND, started_at, NOW()) >= ?",
    [interval]
  );

  if (expiredRounds.length === 0) {
    return NextResponse.json({ success: true, message: 'No expired rounds to draw.' });
  }

  let drawn = 0;
  for (const round of expiredRounds as any[]) {
    try {
      const conn = await (await import('@/lib/db')).getConnection();
      await conn.beginTransaction();

      const bettors = await conn.execute<RowDataPacket[]>(
        'SELECT user_id, SUM(amount) as total FROM promotion_bets WHERE round_id = ? GROUP BY user_id',
        [round.id]
      );

      let winnerId = null;
      let winnerAmount = 0;
      let platformAmount = 0;

      if ((bettors[0] as any[]).length > 0) {
        const bList = bettors[0] as any[];
        const totalPool = bList.reduce((sum: number, b: any) => sum + parseFloat(b.total), 0);
        const rand = Math.random() * totalPool;
        let cum = 0;
        for (const b of bList) {
          cum += parseFloat(b.total);
          if (rand <= cum) { winnerId = b.user_id; break; }
        }

        winnerAmount = totalPool * config.promotionWinnerPercentage;
        platformAmount = totalPool - winnerAmount;
        await conn.execute('UPDATE users SET apex_balance = apex_balance + ? WHERE id = ?', [winnerAmount, winnerId]);
        await conn.execute(
          "INSERT INTO platform_income (source, amount, reference, created_at) VALUES ('promotion', ?, ?, NOW())",
          [platformAmount, 'PR-' + randomHex(4).toUpperCase()]
        );
      }

      await conn.execute(
        'UPDATE promotion_rounds SET status = "completed", winner_id = ?, total_pot = ?, winner_amount = ?, platform_amount = ?, ended_at = NOW() WHERE id = ?',
        [winnerId, round.total_pot, winnerAmount, platformAmount, round.id]
      );
      await conn.execute("INSERT INTO promotion_rounds (status, started_at) VALUES ('open', NOW())");

      await conn.commit();
      conn.release();
      drawn++;
    } catch {}
  }

  return NextResponse.json({ success: true, message: `Drawn ${drawn} round(s).` });
}

export const dynamic = 'force-dynamic';
