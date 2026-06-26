import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = parseInt(process.env.SMTP_PORT || '587');

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: !(process.env.SMTP_SECURE === 'true'),
    tls: { rejectUnauthorized: false },
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

export async function sendMail(to: string | string[], subject: string, html: string, fromName?: string): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  const from = fromName
    ? `"${fromName}" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@apexlink.app'}>`
    : process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@apexlink.app';

  if (!transporter) {
    console.log('--- MAIL (SMTP not configured) ---');
    console.log('To:', Array.isArray(to) ? to.join(', ') : to);
    console.log('Subject:', subject);
    console.log('Body:', html.replace(/<[^>]*>/g, '').substring(0, 500));
    console.log('--- END MAIL ---');
    return { sent: true };
  }

  const recipients = Array.isArray(to) ? to : [to];

  try {
    await transporter.sendMail({
      from,
      to: recipients.join(', '),
      subject,
      html,
    });
    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err.message };
  }
}
