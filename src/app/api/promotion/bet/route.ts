import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  if (!session.activated) return NextResponse.json({ success: false, error: 'Account not activated' }, { status: 403 });

  if (process.env.PROMOTIONS_ENABLED === '0') {
    return NextResponse.json({ success: false, error: 'Promotions are currently disabled by the admin' }, { status: 403 });
  }

  const { amount } = await req.json();
  const amt = parseFloat(amount);
  if (amt <= 0) return NextResponse.json({ success: false, error: 'Invalid bet amount' }, { status: 400 });

  const users = await query<RowDataPacket[]>('SELECT apex_balance FROM users WHERE id = ?', [session.userId]);
  if (users.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  const apexBalance = parseFloat((users[0] as any).apex_balance);
  if (amt > apexBalance) return NextResponse.json({ success: false, error: 'Insufficient token balance' }, { status: 400 });

  try {
    const conn = await (await import('@/lib/db')).getConnection();
    await conn.beginTransaction();

    let rounds = await conn.execute<RowDataPacket[]>("SELECT id FROM promotion_rounds WHERE status = 'open' LIMIT 1");
    let roundId: number;
    if ((rounds[0] as any[]).length === 0) {
      const r = await conn.execute("INSERT INTO promotion_rounds (status, started_at) VALUES ('open', NOW())");
      roundId = (r[0] as any).insertId;
    } else {
      roundId = (rounds[0] as any[])[0].id;
    }

    await conn.execute('UPDATE users SET apex_balance = apex_balance - ? WHERE id = ?', [amt, session.userId]);
    await conn.execute('INSERT INTO promotion_bets (user_id, round_id, amount, created_at) VALUES (?, ?, ?, NOW())', [session.userId, roundId, amt]);
    await conn.execute('UPDATE promotion_rounds SET total_pot = total_pot + ? WHERE id = ?', [amt, roundId]);

    await conn.commit();
    conn.release();
    return NextResponse.json({ success: true, message: `Bet placed! ${Math.round(amt).toLocaleString()} ${config.tokenName} entered the pool.` });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to place bet' }, { status: 500 });
  }
}
