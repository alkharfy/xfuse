import crypto from 'crypto';

const SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL = 30 * 60 * 1000;

function generateCsrfToken() {
  const timestamp = Date.now().toString(36);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}.${nonce}`;
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifyCsrf(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [timestamp, nonce, signature] = parts;
  const payload = `${timestamp}.${nonce}`;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) return false;
  const created = parseInt(timestamp, 36);
  if (isNaN(created) || Date.now() - created > TOKEN_TTL) return false;
  return true;
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}

function validateContactForm(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return { valid: false, errors: [{ field: 'body', message: 'Invalid request body' }], sanitized: null };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!name || name.length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  if (name.length > 100) errors.push({ field: 'name', message: 'Name too long' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) errors.push({ field: 'email', message: 'Valid email is required' });
  if (!message || message.length < 10) errors.push({ field: 'message', message: 'Message must be at least 10 characters' });
  if (message.length > 5000) errors.push({ field: 'message', message: 'Message too long' });
  return {
    valid: errors.length === 0,
    errors,
    sanitized: { name: escapeHtml(name), email: escapeHtml(email), company: escapeHtml(company), message: escapeHtml(message) }
  };
}

// Rate limiting (in-memory, best-effort for serverless)
const requests = new Map();
const MAX = parseInt(process.env.RATE_LIMIT_MAX) || 5;
const WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;

function checkRateLimit(ip) {
  if (!ip) return false;
  const now = Date.now();
  const entry = requests.get(ip);
  if (!entry || now - entry.start > WINDOW) { requests.set(ip, { count: 1, start: now }); return true; }
  if (entry.count >= MAX) return false;
  entry.count++;
  return true;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = generateCsrfToken();
    return res.status(200).json({ csrfToken: token });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(clientIp)) return res.status(429).json({ error: 'Too many requests' });

    const csrfToken = req.headers['x-csrf-token'];
    if (!verifyCsrf(csrfToken)) return res.status(403).json({ error: 'Invalid CSRF token' });

    const { valid, errors, sanitized } = validateContactForm(req.body);
    if (!valid) return res.status(400).json({ error: 'Validation failed', details: errors });

    if (req.body.website) return res.status(200).json({ success: true });

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.log('Contact form:', JSON.stringify(sanitized));
      return res.status(200).json({ success: true, message: 'Message received' });
    }

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: process.env.CONTACT_EMAIL || 'hello@xfuse.dev' }] }],
        from: { email: 'noreply@xfuse.dev', name: 'Xfuse Contact Form' },
        reply_to: { email: sanitized.email, name: sanitized.name },
        subject: `New Contact: ${sanitized.name}`,
        content: [{ type: 'text/html', value: `<h2>New Contact</h2><p><b>Name:</b> ${sanitized.name}</p><p><b>Email:</b> ${sanitized.email}</p><p><b>Company:</b> ${sanitized.company || 'N/A'}</p><hr><p>${sanitized.message.replace(/\n/g, '<br>')}</p>` }],
      }),
    });

    return res.status(200).json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error('Contact error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
