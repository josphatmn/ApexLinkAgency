import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to: string | string[], subject: string, html: string, fromName?: string): Promise<{ sent: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log('--- MAIL (Resend not configured) ---');
    console.log('To:', Array.isArray(to) ? to.join(', ') : to);
    console.log('Subject:', subject);
    console.log('Body:', html.replace(/<[^>]*>/g, '').substring(0, 500));
    console.log('--- END MAIL ---');
    return { sent: true };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const fromAddress = process.env.RESEND_FROM || 'onboarding@resend.dev';
  const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

  try {
    const { error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
    });

    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err.message };
  }
}
