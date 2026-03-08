/**
 * Xfuse — Server-side Rate Limiter (Serverless-compatible)
 * 
 * Uses in-memory Map as a best-effort rate limiter for serverless.
 * On Vercel, each cold start resets the map — this provides partial
 * protection during warm instances. For production, replace with
 * Upstash Redis (@upstash/ratelimit) for true distributed limiting.
 * 
 * The in-memory approach still guards against:
 * - Rapid-fire requests within a single warm instance
 * - Automated bots hitting the same instance repeatedly
 */
const requests = new Map();
const MAX = parseInt(process.env.RATE_LIMIT_MAX) || 5;
const WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;

export function checkRateLimit(ip) {
  if (!ip) return false;

  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now - entry.start > WINDOW) {
    requests.set(ip, { count: 1, start: now });
    return true;
  }

  if (entry.count >= MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export function getRateLimitHeaders(ip) {
  const entry = requests.get(ip);
  if (!entry) return {};
  const remaining = Math.max(0, MAX - entry.count);
  const reset = Math.ceil((entry.start + WINDOW - Date.now()) / 1000);
  return {
    'X-RateLimit-Limit': String(MAX),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.max(0, reset)),
  };
}
