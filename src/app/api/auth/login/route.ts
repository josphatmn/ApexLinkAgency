import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const users = await query<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[0] as any;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    await setSession({
      userId: user.id,
      username: user.username,
      activated: Boolean(user.activated),
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      activated: Boolean(user.activated),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
