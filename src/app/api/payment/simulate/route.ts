import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await execute('UPDATE users SET activated = 1, activated_at = NOW() WHERE id = ?', [session.userId]);

    let totalCommission = 0;

    const users = await query<RowDataPacket[]>(
      'SELECT referred_by, username FROM users WHERE id = ?',
      [session.userId]
    );

    if (users.length > 0) {
      const user = users[0] as any;
      if (user.referred_by > 0) {
        const level1Commission = config.activationFee * config.level1CommissionRate;
        await execute(
          "INSERT INTO commissions (user_id, from_user_id, level, amount, status, created_at) VALUES (?, ?, 1, ?, 'pending', NOW())",
          [user.referred_by, session.userId, level1Commission]
        );
        await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [level1Commission, user.referred_by]);
        totalCommission += level1Commission;

        // Level 2
        const refUsers = await query<RowDataPacket[]>(
          'SELECT referred_by FROM users WHERE id = ?',
          [user.referred_by]
        );
        if (refUsers.length > 0 && refUsers[0].referred_by > 0) {
          const level2Commission = config.activationFee * config.level2CommissionRate;
          await execute(
            "INSERT INTO commissions (user_id, from_user_id, level, amount, status, created_at) VALUES (?, ?, 2, ?, 'pending', NOW())",
            [refUsers[0].referred_by, session.userId, level2Commission]
          );
          await execute('UPDATE users SET balance = balance + ? WHERE id = ?', [level2Commission, refUsers[0].referred_by]);
          totalCommission += level2Commission;
        }
      }
    }

    const platformShare = config.activationFee - totalCommission;
    await execute(
      "INSERT INTO platform_income (source, amount, reference, created_at) VALUES ('activation', ?, ?, NOW())",
      [platformShare, 'ACT-' + randomHex(4).toUpperCase()]
    );

    await execute(
      "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'payment', ?, 'SIMULATED', 'completed', NOW())",
      [session.userId, config.activationFee]
    );

    return NextResponse.json({ success: true, message: 'Payment successful! Account activated.' });
  } catch {
    return NextResponse.json({ success: false, error: 'Payment processing failed' }, { status: 500 });
  }
}
