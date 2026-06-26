import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { submitOrder, registerIPN, isPesapalConfigured } from '@/lib/pesapal';

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

    if (!isPesapalConfigured()) {
      const fakeId = 'PESA-' + randomHex(6).toUpperCase();
      return NextResponse.json({
        success: true,
        simulated: true,
        orderTrackingId: fakeId,
        merchantReference: fakeId,
        redirectUrl: null,
        message: 'DEV MODE: Simulated payment (PesaPal not configured).',
      });
    }

    const merchantRef = 'ACT-' + randomHex(6).toUpperCase();
    const callbackUrl = `${config.siteUrl}/payment/callback`;
    const ipnUrl = `${config.siteUrl}/api/pesapal/webhook`;

    let notificationId = process.env.PESAPAL_NOTIFICATION_ID || '';
    if (!notificationId) {
      try {
        const ipn = await registerIPN(ipnUrl, 'POST');
        notificationId = ipn.ipn_id;
      } catch {
        return NextResponse.json({ success: false, error: 'Failed to register IPN URL' }, { status: 500 });
      }
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

    return NextResponse.json({
      success: true,
      simulated: false,
      orderTrackingId: result.order_tracking_id,
      merchantReference: result.merchant_reference,
      redirectUrl: result.redirect_url,
      message: 'Redirecting to PesaPal...',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to initiate payment' }, { status: 500 });
  }
}
