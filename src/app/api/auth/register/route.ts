import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, execute } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { config } from '@/lib/config';
import { generateReferralCode, getCountryPrefix } from '@/lib/utils';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const { username, country, phone, password, referralCode, agree } = await req.json();

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ success: false, error: 'Username must be 3-20 characters' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ success: false, error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    const existing = await query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 400 });
    }

    const validCountries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda'];
    if (!validCountries.includes(country)) {
      return NextResponse.json({ success: false, error: 'Invalid country' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const prefix = getCountryPrefix(country);
    const fullPhone = prefix + phone;
    const phoneExists = await query<RowDataPacket[]>('SELECT id FROM users WHERE phone = ?', [fullPhone]);
    if (phoneExists.length > 0) {
      return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!agree) {
      return NextResponse.json({ success: false, error: 'You must agree to the terms' }, { status: 400 });
    }

    // Resolve referral
    let referrerId = 0;
    let referrerUsername = 'Platform';
    let refCode = referralCode || config.defaultReferralCode;

    if (refCode !== config.defaultReferralCode) {
      const ref = await query<RowDataPacket[]>('SELECT id, username FROM users WHERE referral_code = ?', [refCode]);
      if (ref.length === 0) {
        refCode = config.defaultReferralCode;
      } else {
        referrerId = ref[0].id;
        referrerUsername = ref[0].username;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRefCode = generateReferralCode();

    const result = await execute(
      'INSERT INTO users (username, country, phone, password, referral_code, referred_by, referred_by_username, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [username, country, fullPhone, hashedPassword, userRefCode, referrerId, referrerUsername]
    );

    const userId = (result as any).insertId;

    await setSession({
      userId,
      username,
      activated: false,
    });

    return NextResponse.json({ success: true, message: 'Registration successful!' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
