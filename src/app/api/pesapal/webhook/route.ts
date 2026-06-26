import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderTrackingId = body.OrderTrackingId || '';
    const orderMerchantReference = body.OrderMerchantReference || '';
    const orderNotificationType = body.OrderNotificationType || '';

    await execute(
      `INSERT INTO pesapal_webhooks (order_tracking_id, merchant_reference, notification_type, raw_body, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [orderTrackingId, orderMerchantReference, orderNotificationType, JSON.stringify(body)]
    );

    return NextResponse.json({
      orderNotificationType,
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    });
  } catch {
    return NextResponse.json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId: '',
      orderMerchantReference: '',
      status: 500,
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const orderTrackingId = req.nextUrl.searchParams.get('OrderTrackingId') || '';
    const orderMerchantReference = req.nextUrl.searchParams.get('OrderMerchantReference') || '';
    const orderNotificationType = req.nextUrl.searchParams.get('OrderNotificationType') || '';

    if (orderTrackingId) {
      await execute(
        `INSERT INTO pesapal_webhooks (order_tracking_id, merchant_reference, notification_type, raw_body, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [orderTrackingId, orderMerchantReference, orderNotificationType || 'GET', req.url]
      );
    }

    return NextResponse.json({
      orderNotificationType: orderNotificationType || 'IPNCHANGE',
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    });
  } catch {
    return NextResponse.json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId: '',
      orderMerchantReference: '',
      status: 500,
    }, { status: 500 });
  }
}
