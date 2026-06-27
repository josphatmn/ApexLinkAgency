import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { sendMail } from '@/lib/mail';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.isAdmin ? payload : null;
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { user_ids, subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: 'Subject and message are required' }, { status: 400 });
    }

    let emails: string[] = [];

    if (Array.isArray(user_ids) && user_ids.length > 0) {
      const placeholders = user_ids.map(() => '?').join(',');
      const users = await query<RowDataPacket[]>(
        `SELECT email FROM users WHERE id IN (${placeholders}) AND email IS NOT NULL AND email != ''`,
        user_ids,
      );
      emails = users.map((u: any) => u.email);
    }

    if (emails.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients with email addresses' }, { status: 400 });
    }

    const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#18181b;margin-bottom:16px">${subject}</h2>
      <div style="color:#3f3f46;line-height:1.7;white-space:pre-wrap">${message}</div>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0" />
      <p style="color:#a1a1aa;font-size:12px">Apexlink Agency</p>
    </div>`;

    let fromName = 'Apexlink Agency';

    const result = await sendMail(emails, fromName, subject, html);

    if (!result.sent) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${emails.length} recipient(s)`,
      recipientCount: emails.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
