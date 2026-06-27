import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to: string | string[], subject: string, html: string): Promise<{ sent: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log('--- MAIL (Resend not configured) ---');
    console.log('To:', Array.isArray(to) ? to.join(', ') : to);
    console.log('Subject:', subject);
    console.log('Body:', html.replace(/<[^>]*>/g, '').substring(0, 500));
    console.log('--- END MAIL ---');
    return { sent: true };
  }

  const recipients = [...new Set(Array.isArray(to) ? to : [to])].filter(Boolean) as string[];

  if (recipients.length === 0) return { sent: false, error: 'No recipients' };

  const from = process.env.RESEND_FROM || 'onboarding@resend.dev';

  try {
    const { error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      if (error.message?.includes('testing emails')) {
        console.log('--- MAIL (Resend test mode — logged instead) ---');
        console.log('To:', recipients.join(', '));
        console.log('Subject:', subject);
        console.log('Body:', html.replace(/<[^>]*>/g, '').substring(0, 500));
        console.log('--- END MAIL ---');
        return { sent: true };
      }
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (err: any) {
    return { sent: false, error: err.message };
  }
}
