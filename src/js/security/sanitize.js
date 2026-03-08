/**
 * Xfuse — Input Sanitization & Validation
 */

/** Sanitize user input to prevent XSS */
export function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/** Validate email format */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate contact form data */
export function validateContactForm(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (data.message && data.message.length > 5000) {
    errors.push({ field: 'message', message: 'Message too long (max 5000 chars)' });
  }

  // Honeypot check — hidden field must be empty
  if (data.website) {
    errors.push({ field: 'honeypot', message: 'Bot detected' });
  }

  return { valid: errors.length === 0, errors };
}
