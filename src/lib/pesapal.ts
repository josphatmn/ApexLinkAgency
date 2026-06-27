import { query, execute } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { randomHex } from '@/lib/utils';

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

export function simulatedResponse(merchantRef: string) {
  const fakeId = 'PESA-' + randomHex(6).toUpperCase();
  return {
    simulated: true,
    orderTrackingId: fakeId,
    merchantReference: merchantRef,
    redirectUrl: null,
    message: 'DEV MODE: Simulated payment (PesaPal not available).',
  } as const;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const { consumerKey, consumerSecret } = getCredentials();
  if (!consumerKey || !consumerSecret) return null;

  try {
    const res = await fetch(`${BASE_URL}/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.token) return null;

    tokenCache = { token: data.token, expiresAt: Date.now() + 4 * 60 * 1000 };
    return data.token;
  } catch {
    return null;
  }
}

export async function registerIPN(url: string, type: 'GET' | 'POST' = 'POST') {
  const token = await getAccessToken();
  if (!token) throw new Error('PesaPal not configured or unreachable');

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

export async function getNotificationId(siteUrl: string): Promise<string | null> {
  const fromEnv = process.env.PESAPAL_NOTIFICATION_ID;
  if (fromEnv) return fromEnv;

  try {
    const rows = await query<RowDataPacket[]>(
      "SELECT `value` FROM app_settings WHERE `key` = 'pesapal_notification_id' LIMIT 1",
    );
    if (rows.length > 0 && rows[0].value) return rows[0].value;
  } catch {
    // table might not exist on fresh deploy
  }

  try {
    const ipnUrl = `${siteUrl}/api/pesapal/webhook`;
    const ipn = await registerIPN(ipnUrl, 'POST');
    if (ipn?.ipn_id) {
      try {
        await execute(
          "INSERT INTO app_settings (`key`, `value`) VALUES ('pesapal_notification_id', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
          [ipn.ipn_id],
        );
      } catch {
        // non-critical
      }
      return ipn.ipn_id;
    }
  } catch {
    // IPN registration failed
  }

  return null;
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
): Promise<SubmitOrderResult | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const billingAddress: Record<string, string> = { country_code: 'KE' };
  if (phoneNumber) billingAddress.phone_number = phoneNumber;
  if (email) billingAddress.email_address = email;
  if (firstName) billingAddress.first_name = firstName;
  if (lastName) billingAddress.last_name = lastName;

  try {
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

    if (!res.ok) return null;

    const data = await res.json();
    return data as SubmitOrderResult;
  } catch {
    return null;
  }
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

export async function getTransactionStatus(orderTrackingId: string): Promise<TransactionStatus | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as TransactionStatus;
  } catch {
    return null;
  }
}
