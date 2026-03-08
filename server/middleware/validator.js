/**
 * Xfuse — Server-side Input Validation & Sanitization
 * This is the critical validation layer — never trust client-side alone
 */

// Strict HTML entity encoding
function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}

export function validateContactForm(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Invalid request body' }], sanitized: null };
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  // Name validation
  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  if (name.length > 100) {
    errors.push({ field: 'name', message: 'Name too long (max 100 characters)' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address' });
  }
  if (email.length > 254) {
    errors.push({ field: 'email', message: 'Email too long' });
  }

  // Company validation (optional)
  if (company.length > 200) {
    errors.push({ field: 'company', message: 'Company name too long (max 200 characters)' });
  }

  // Message validation
  if (!message || message.length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters' });
  }
  if (message.length > 5000) {
    errors.push({ field: 'message', message: 'Message too long (max 5000 characters)' });
  }

  // Sanitize all fields
  const sanitized = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(company),
    message: escapeHtml(message),
  };

  return { valid: errors.length === 0, errors, sanitized };
}
