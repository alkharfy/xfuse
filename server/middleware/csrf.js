/**
 * Xfuse — CSRF Token Validation (Stateless HMAC)
 * Works on serverless (Vercel) — no in-memory state needed.
 * Uses HMAC-signed tokens with embedded timestamp.
 */
import crypto from 'crypto';

const SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL = 30 * 60 * 1000; // 30 minutes

export function generateCsrfToken() {
  const timestamp = Date.now().toString(36);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}.${nonce}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

export function verifyCsrf(token) {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;
  const payload = `${timestamp}.${nonce}`;

  // Verify signature
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
    return false;
  }

  // Check expiration
  const created = parseInt(timestamp, 36);
  if (isNaN(created) || Date.now() - created > TOKEN_TTL) {
    return false;
  }

  return true;
}
