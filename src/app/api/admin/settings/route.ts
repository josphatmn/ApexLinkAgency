import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.isAdmin ? payload : null;
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = await readFile(envPath, 'utf-8');
    const settings: Record<string, string> = {};

    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [k, ...v] = trimmed.split('=');
      if (k) settings[k.trim()] = v.join('=').trim();
    });

    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ success: false, error: 'Could not read settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const editable = [
    'SITE_NAME', 'SITE_URL', 'DEFAULT_REFERRAL_CODE', 'ACTIVATION_FEE', 'LEVEL1_COMMISSION_RATE',
    'LEVEL2_COMMISSION_RATE', 'WITHDRAWAL_THRESHOLD', 'WITHDRAWAL_FEE_PERCENTAGE',
    'APEX_CONVERSION_RATE', 'TOKEN_NAME', 'CURRENCY_SYMBOL', 'TOKEN_EXCHANGE_RATE', 'PROMOTION_WINNER_PERCENTAGE', 'PROMOTION_INTERVAL_MINUTES',
    'PROMOTIONS_ENABLED', 'INCOME_PER_PAGE', 'MEDIA_ACCESS_COST',
  ];

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const updates = await req.json();
    let content = await readFile(envPath, 'utf-8');
    const lines = content.split('\n');
    const out = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const [k] = trimmed.split('=');
      const key = k.trim();
      if (editable.includes(key) && updates[key] !== undefined) {
        return `${key}=${updates[key]}`;
      }
      return line;
    });

    await writeFile(envPath, out.join('\n'));
    return NextResponse.json({ success: true, message: 'Settings saved. Reloading...' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
