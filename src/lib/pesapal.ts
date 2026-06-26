const BASE_URL = process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3/api';

interface Creds {
  consumerKey: string;
  consumerSecret: string;
}

function getCredentials(): Creds {
  return {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  };
}

export function isPesapalConfigured(): boolean {
  const c = getCredentials();
  return !!(c.consumerKey && c.consumerSecret);
}

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const { consumerKey, consumerSecret } = getCredentials();

  const res = await fetch(`${BASE_URL}/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PesaPal auth failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const token = data.token;
  if (!token) throw new Error('PesaPal auth returned no token');

  tokenCache = { token, expiresAt: Date.now() + 4 * 60 * 1000 };
  return token;
}

export async function registerIPN(url: string, type: 'GET' | 'POST' = 'POST') {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, ipn_notification_type: type }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PesaPal registerIPN failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data as { ipn_id: string; url: string; status: string };
}

export interface SubmitOrderResult {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status: string;
}

export async function submitOrder(
  id: string,
  amount: number,
  description: string,
  callbackUrl: string,
  notificationId: string,
  phoneNumber?: string,
  email?: string,
  firstName?: string,
  lastName?: string,
): Promise<SubmitOrderResult> {
  const token = await getAccessToken();

  const billingAddress: Record<string, string> = { country_code: 'KE' };
  if (phoneNumber) billingAddress.phone_number = phoneNumber;
  if (email) billingAddress.email_address = email;
  if (firstName) billingAddress.first_name = firstName;
  if (lastName) billingAddress.last_name = lastName;

  const res = await fetch(`${BASE_URL}/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id,
      currency: 'KES',
      amount,
      description,
      callback_url: callbackUrl,
      notification_id: notificationId,
      billing_address: billingAddress,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PesaPal submitOrder failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data as SubmitOrderResult;
}

export interface TransactionStatus {
  payment_method?: string;
  amount?: number;
  confirmation_code?: string;
  payment_status_description?: string;
  status_code?: number;
  merchant_reference?: string;
  payment_account?: string;
  description?: string;
  message?: string;
  status: string;
}

export async function getTransactionStatus(orderTrackingId: string): Promise<TransactionStatus> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PesaPal getTransactionStatus failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data as TransactionStatus;
}
