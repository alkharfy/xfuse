/**
 * Xfuse — Contact Form Handler
 * Vercel Serverless Function
 */
import { validateContactForm } from '../middleware/validator.js';
import { checkRateLimit, getRateLimitHeaders } from '../middleware/rate-limiter.js';
import { generateCsrfToken, verifyCsrf } from '../middleware/csrf.js';
import { sendEmail } from '../utils/email.js';

export default async function handler(req, res) {
  // GET — return CSRF token
  if (req.method === 'GET') {
    const token = generateCsrfToken();
    return res.status(200).json({ csrfToken: token });
  }

  // Only POST allowed for submission
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      const headers = getRateLimitHeaders(clientIp);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // CSRF verification
    const csrfToken = req.headers['x-csrf-token'];
    if (!verifyCsrf(csrfToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    // Validate input
    const { valid, errors, sanitized } = validateContactForm(req.body);
    if (!valid) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Honeypot check
    if (req.body.website) {
      return res.status(200).json({ success: true }); // Silent fail for bots
    }

    // Send email
    await sendEmail({
      to: process.env.CONTACT_EMAIL || 'hello@xfuse.dev',
      subject: `New Contact: ${sanitized.name}`,
      name: sanitized.name,
      email: sanitized.email,
      company: sanitized.company,
      message: sanitized.message,
    });

    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
