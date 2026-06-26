import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { randomHex } from '@/lib/utils';
import { requestPayment, isSasapayConfigured } from '@/lib/sasapay';

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
    if (normalized.startsWith('0')) {
      normalized = '254' + normalized.slice(1);
    } else if (normalized.startsWith('+')) {
      normalized = normalized.slice(1);
    } else if (!normalized.startsWith('254')) {
      normalized = '254' + normalized;
    }
    if (!/^254\d{9}$/.test(normalized)) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    const accountRef = 'ACT-' + randomHex(6).toUpperCase();
    const callbackUrl = `${config.siteUrl}/api/sasapay/webhook`;

    if (!isSasapayConfigured()) {
      return NextResponse.json({
        success: true,
        simulated: true,
        checkoutId: 'SIM-' + randomHex(6).toUpperCase(),
        accountRef,
        message: 'DEV MODE: Simulated payment (SasaPay not configured).',
      });
    }

    const result = await requestPayment(config.activationFee, normalized, accountRef, callbackUrl);

    return NextResponse.json({
      success: true,
      simulated: false,
      checkoutId: result.CheckoutRequestID,
      accountRef,
      message: 'STK push sent! Check your phone and enter your M-Pesa PIN.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to initiate payment' }, { status: 500 });
  }
}
