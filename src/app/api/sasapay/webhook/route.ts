import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const checkoutRequestId = body.CheckoutRequestID || body.checkoutRequestId || '';
    const resultCode = body.ResultCode ?? body.resultCode ?? '';
    const resultDesc = body.ResultDesc || body.resultDesc || '';
    const merchantRequestId = body.MerchantRequestID || body.merchantRequestId || '';
    const paymentRequestId = body.PaymentRequestID || body.paymentRequestId || '';
    const sourceChannel = body.SourceChannel || body.sourceChannel || '';
    const transAmount = body.TransAmount || body.transAmount || '';
    const paid = body.Paid === true || body.Paid === 'true' ? 1 : 0;
    const billRef = body.BillRefNumber || body.billRefNumber || '';
    const transactionDate = body.TransactionDate || body.transactionDate || '';
    const customerMobile = body.CustomerMobile || body.customerMobile || '';
    const transactionCode = body.TransactionCode || body.transactionCode || '';
    const thirdPartyTransId = body.ThirdPartyTransID || body.thirdPartyTransID || '';
    const firstName = body.FirstName || body.firstName || '';
    const middleName = body.MiddleName || body.middleName || '';
    const lastName = body.LastName || body.lastName || '';
    const msisdn = body.MSISDN || body.msisdn || '';

    // Also handle IPN format
    const transId = body.TransID || body.transId || transactionCode;
    const transTime = body.TransTime || body.transTime || transactionDate;
    const businessShortCode = body.BusinessShortCode || body.businessShortCode || '';

    await execute(
      `INSERT INTO sasapay_webhooks
       (trans_id, transaction_code, checkout_request_id, merchant_request_id, payment_request_id,
        result_code, result_desc, source_channel, paid, trans_amount, bill_ref,
        transaction_date, customer_mobile, third_party_trans_id,
        first_name, middle_name, last_name, msisdn, trans_time, business_short_code,
        raw_body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        transId, transactionCode, checkoutRequestId, merchantRequestId, paymentRequestId,
        resultCode, resultDesc, sourceChannel, paid, transAmount, billRef,
        transactionDate, customerMobile, thirdPartyTransId,
        firstName, middleName, lastName, msisdn, transTime, businessShortCode,
        JSON.stringify(body),
      ]
    );

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal error' });
  }
}
