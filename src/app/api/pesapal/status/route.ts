import { NextRequest, NextResponse } from 'next/server';
import { getTransactionStatus } from '@/lib/pesapal';

export async function GET(req: NextRequest) {
  const orderTrackingId = req.nextUrl.searchParams.get('orderTrackingId');
  if (!orderTrackingId) {
    return NextResponse.json({ success: false, error: 'Missing orderTrackingId' }, { status: 400 });
  }

  const result = await getTransactionStatus(orderTrackingId);

  if (!result) {
    return NextResponse.json({ success: false, error: 'Failed to check payment status' }, { status: 502 });
  }

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
}
