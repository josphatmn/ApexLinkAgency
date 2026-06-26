import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const checkoutId = req.nextUrl.searchParams.get('checkoutId');
  if (!checkoutId) {
    return NextResponse.json({ success: false, error: 'Missing checkoutId' }, { status: 400 });
  }

  try {
    const rows = await query<RowDataPacket[]>(
      `SELECT paid, result_code, result_desc, transaction_code, created_at
       FROM sasapay_webhooks
       WHERE checkout_request_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [checkoutId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: true, paid: false, status: 'pending' });
    }

    const row = rows[0];
    const paid = row.paid === 1 || row.result_code === '0';

    return NextResponse.json({
      success: true,
      paid,
      status: paid ? 'completed' : 'failed',
      resultCode: row.result_code,
      resultDesc: row.result_desc,
      transactionCode: row.transaction_code,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Status check failed' }, { status: 500 });
  }
}
