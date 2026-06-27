import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { submitOrder, getNotificationId, isPesapalConfigured, simulatedResponse } from '@/lib/pesapal';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { phone } = await req.json();
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

    const merchantRef = 'ACT-' + randomHex(6).toUpperCase();

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
      config.activationFee,
      'Account activation payment',
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

    return NextResponse.json({
      success: true,
      simulated: false,
      orderTrackingId: result.order_tracking_id,
      merchantReference: merchantRef,
      redirectUrl: result.redirect_url,
      message: 'Redirecting to PesaPal...',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to initiate payment' }, { status: 500 });
  }
}
