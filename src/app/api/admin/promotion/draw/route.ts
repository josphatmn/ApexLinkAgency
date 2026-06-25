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

export async function POST(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { round_id } = await req.json();

  const rounds = await query<RowDataPacket[]>('SELECT * FROM promotion_rounds WHERE id=? AND status=?', [round_id, 'open']);
  if (rounds.length === 0) {
    return NextResponse.json({ success: false, error: 'Round not found or already completed' }, { status: 400 });
  }

  const round = rounds[0] as any;
  const interval = config.promotionIntervalMinutes * 60;
  const elapsed = Math.floor((Date.now() - new Date(round.started_at).getTime()) / 1000);

  if (elapsed < interval) {
    const remaining = interval - elapsed;
    return NextResponse.json({
      success: false,
      error: `Round is still active. ${Math.ceil(remaining / 60)} minutes remaining before draw is allowed.`,
    }, { status: 400 });
  }

  try {
    const conn = await (await import('@/lib/db')).getConnection();
    await conn.beginTransaction();

    const bettors = await conn.execute<RowDataPacket[]>(
      'SELECT user_id, SUM(amount) as total FROM promotion_bets WHERE round_id=? GROUP BY user_id',
      [round_id]
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
      await conn.execute('UPDATE users SET apex_balance = apex_balance + ? WHERE id=?', [winnerAmount, winnerId]);
      await conn.execute(
        "INSERT INTO platform_income (source, amount, reference, created_at) VALUES ('promotion', ?, ?, NOW())",
        [platformAmount, 'PR-' + randomHex(4).toUpperCase()]
      );
    }

    await conn.execute(
      'UPDATE promotion_rounds SET status="completed", winner_id=?, total_pot=?, winner_amount=?, platform_amount=?, ended_at=NOW() WHERE id=?',
      [winnerId, round.total_pot, winnerAmount, platformAmount, round_id]
    );
    await conn.execute("INSERT INTO promotion_rounds (status, started_at) VALUES ('open', NOW())");

    await conn.commit();
    conn.release();

    return NextResponse.json({ success: true, message: 'Winner drawn!' });
  } catch {
    return NextResponse.json({ success: false, error: 'Draw failed' }, { status: 500 });
  }
}
