import { NextRequest, NextResponse } from 'next/server';
import { getTransactionStatus } from '@/lib/pesapal';

export async function GET(req: NextRequest) {
  const orderTrackingId = req.nextUrl.searchParams.get('orderTrackingId');
  if (!orderTrackingId) {
    return NextResponse.json({ success: false, error: 'Missing orderTrackingId' }, { status: 400 });
  }

  try {
    const result = await getTransactionStatus(orderTrackingId);

    const completed = result.status_code === 1;
    const failed = result.status_code === 2 || result.status_code === 0;

    return NextResponse.json({
      success: true,
      completed,
      failed,
      statusCode: result.status_code,
      statusDescription: result.payment_status_description,
      description: result.description,
      confirmationCode: result.confirmation_code,
      paymentMethod: result.payment_method,
      amount: result.amount,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Status check failed' }, { status: 500 });
  }
}
