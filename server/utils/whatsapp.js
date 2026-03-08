/**
 * Xfuse — WhatsApp API Integration (Optional)
 * Sends notification to WhatsApp when a contact form is submitted
 */

export async function sendWhatsAppNotification({ name, email, message }) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;

  if (!token || !phoneNumber) {
    console.log('WhatsApp: No token or phone configured, skipping notification');
    return { success: false, skipped: true };
  }

  const text = `📩 New Contact Form\n\n👤 ${name}\n📧 ${email}\n\n💬 ${message.substring(0, 500)}`;

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumber}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('WhatsApp API error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error('WhatsApp notification failed:', err);
    return { success: false };
  }
}
