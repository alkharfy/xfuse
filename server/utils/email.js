/**
 * Xfuse — Email Sender
 * Supports SendGrid API or fallback to console log
 */

export async function sendEmail({ to, subject, name, email, company, message }) {
  const apiKey = process.env.SENDGRID_API_KEY;

  // If no API key, log to console (development mode)
  if (!apiKey) {
    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log(`To: ${to}`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Company: ${company || 'N/A'}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('===================================');
    return { success: true, dev: true };
  }

  // SendGrid API
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@xfuse.dev', name: 'Xfuse Contact Form' },
      reply_to: { email, name },
      subject,
      content: [
        {
          type: 'text/html',
          value: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Company:</strong> ${company || 'N/A'}</p>
            <hr>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        },
      ],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`SendGrid error: ${res.status} — ${error}`);
  }

  return { success: true };
}
