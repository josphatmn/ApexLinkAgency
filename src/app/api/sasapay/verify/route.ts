import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { execute, query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

async function activateAccount(session: { userId: number; username: string }, checkoutId: string) {
  await execute('UPDATE users SET activated = 1, activated_at = NOW() WHERE id = ?', [session.userId]);
  await setSession({ userId: session.userId, username: session.username, activated: true });

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
    "INSERT INTO transactions (user_id, type, amount, reference, status, created_at) VALUES (?, 'payment', ?, ?, 'completed', NOW())",
    [session.userId, config.activationFee, checkoutId]
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { checkoutId, simulated } = await req.json();
    if (!checkoutId) {
      return NextResponse.json({ success: false, error: 'Missing checkout ID' }, { status: 400 });
    }

    if (simulated || checkoutId.startsWith('SIM-')) {
      await activateAccount(session, checkoutId);
      return NextResponse.json({ success: true, message: 'DEV MODE: Account activated (simulated payment).' });
    }

    // Real flow: verify via webhooks table
    const rows = await query<RowDataPacket[]>(
      `SELECT paid, result_code FROM sasapay_webhooks
       WHERE checkout_request_id = ? AND (paid = 1 OR result_code = '0')
       LIMIT 1`,
      [checkoutId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Payment not yet confirmed. Please wait or try again.' });
    }

    await activateAccount(session, checkoutId);
    return NextResponse.json({ success: true, message: 'Payment successful! Account activated.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
