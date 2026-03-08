/**
 * Xfuse — Client-side Rate Limiting
 * Prevents form spam (max 3 submissions in 5 minutes)
 */
const RATE_LIMIT_KEY = 'xfuse-form-submissions';
const MAX_SUBMISSIONS = 3;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function canSubmitForm() {
  const stored = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '[]');
  const now = Date.now();
  const recent = stored.filter(ts => now - ts < WINDOW_MS);

  if (recent.length >= MAX_SUBMISSIONS) {
    return false;
  }

  recent.push(now);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
  return true;
}
