import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { submitOrder, getNotificationId, isPesapalConfigured, simulatedResponse } from '@/lib/pesapal';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { phone, amount } = await req.json();
    const depositAmount = parseFloat(amount);

    if (!depositAmount || depositAmount < 10) {
      return NextResponse.json({ success: false, error: 'Minimum deposit is 10' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    let normalized = phone.replace(/\s+/g, '');
    if (normalized.startsWith('0')) normalized = '254' + normalized.slice(1);
    else if (normalized.startsWith('+')) normalized = normalized.slice(1);
    else if (!normalized.startsWith('254')) normalized = '254' + normalized;

    if (!/^254\d{9}$/.test(normalized)) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    const merchantRef = 'DEP-' + randomHex(6).toUpperCase();

    await execute(
      'INSERT INTO pending_deposits (user_id, amount, merchant_reference, status, created_at) VALUES (?, ?, ?, ?, NOW())',
      [session.userId, depositAmount, merchantRef, 'pending'],
    );

    if (!isPesapalConfigured()) {
      return NextResponse.json({ success: true, ...simulatedResponse(merchantRef) });
    }

    const callbackUrl = `${config.siteUrl}/payment/callback`;
    const notificationId = await getNotificationId(config.siteUrl);

    if (!notificationId) {
      return NextResponse.json({ success: true, ...simulatedResponse(merchantRef) });
    }

    const result = await submitOrder(
      merchantRef,
      depositAmount,
      'Wallet deposit',
      callbackUrl,
      notificationId,
      normalized,
      session.username + '@apexlink.app',
      session.username,
      '',
    );

    if (!result) {
      return NextResponse.json({ success: true, ...simulatedResponse(merchantRef) });
    }

    await execute(
      'UPDATE pending_deposits SET order_tracking_id = ? WHERE merchant_reference = ?',
      [result.order_tracking_id, merchantRef],
    );

    return NextResponse.json({
      success: true,
      simulated: false,
      orderTrackingId: result.order_tracking_id,
      merchantReference: merchantRef,
      redirectUrl: result.redirect_url,
      message: 'Redirecting to PesaPal...',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to initiate deposit' }, { status: 500 });
  }
}
