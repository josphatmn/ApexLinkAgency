import { NextResponse } from 'next/server';

export async function GET() {
  const enabled = process.env.PROMOTIONS_ENABLED !== '0';
  return NextResponse.json({ success: true, enabled });
}
