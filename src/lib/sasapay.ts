const BASE_URL = process.env.SASAPAY_BASE_URL || 'https://sandbox.sasapay.app/api/v1';

interface Creds {
  clientId: string;
  clientSecret: string;
  merchantCode: string;
}

function getCredentials(): Creds {
  return {
    clientId: process.env.SASAPAY_CLIENT_ID || '',
    clientSecret: process.env.SASAPAY_CLIENT_SECRET || '',
    merchantCode: process.env.SASAPAY_MERCHANT_CODE || '',
  };
}

export function isSasapayConfigured(): boolean {
  const c = getCredentials();
  return !!(c.clientId && c.clientSecret && c.merchantCode);
}

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const { clientId, clientSecret } = getCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${BASE_URL}/auth/token/?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${basic}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sasapay auth failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const token = data.access_token;
  if (!token) throw new Error('Sasapay auth returned no access_token');

  tokenCache = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return token;
}

export interface RequestPaymentResult {
  status: boolean;
  detail: string;
  PaymentGateway?: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  TransactionReference?: string;
  ResponseCode?: string;
}

export async function requestPayment(
  amount: number,
  phoneNumber: string,
  accountReference: string,
  callbackUrl: string,
  networkCode = '63902'
): Promise<RequestPaymentResult> {
  const token = await getAccessToken();
  const { merchantCode } = getCredentials();

  const res = await fetch(`${BASE_URL}/payments/request-payment/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      MerchantCode: merchantCode,
      NetworkCode: networkCode,
      PhoneNumber: phoneNumber,
      Amount: amount.toFixed(2),
      Currency: 'KES',
      AccountReference: accountReference,
      TransactionDesc: 'Account activation payment',
      CallBackURL: callbackUrl,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.ResponseDescription || `Sasapay request-payment failed (${res.status})`);
  }

  return data as RequestPaymentResult;
}

export interface ProcessPaymentResult {
  status: boolean;
  detail: string;
}

export async function processPayment(
  checkoutRequestId: string,
  verificationCode: string
): Promise<ProcessPaymentResult> {
  const token = await getAccessToken();
  const { merchantCode } = getCredentials();

  const res = await fetch(`${BASE_URL}/payments/process-payment/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      MerchantCode: merchantCode,
      CheckoutRequestID: checkoutRequestId,
      VerificationCode: verificationCode,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || `Sasapay process-payment failed (${res.status})`);
  }

  return data as ProcessPaymentResult;
}

export async function checkTransactionStatus(checkoutRequestId: string) {
  const token = await getAccessToken();
  const { merchantCode } = getCredentials();

  const res = await fetch(`${BASE_URL}/waas/transaction-status/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      merchantCode,
      checkoutRequestId,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data as any;
}
