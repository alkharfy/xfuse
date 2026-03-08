/**
 * Xfuse — Contact Form
 */
import { sanitizeInput, isValidEmail, validateContactForm } from '../security/sanitize.js';
import { canSubmitForm } from '../security/rate-limit.js';

const messages = {
  en: {
    rateLimit: 'Too many requests. Please try again later.',
    success: 'Message sent successfully!',
    error: 'Something went wrong. Please try again.',
  },
  ar: {
    rateLimit: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.',
    success: 'تم إرسال الرسالة بنجاح!',
    error: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  },
};

function getLang() {
  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

export function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  // Floating label: add .has-value class
  const inputs = form.querySelectorAll('input, textarea, select');
  const checkValue = (el) => el.closest('.form-group')?.classList.toggle('has-value', el.value.trim().length > 0);
  inputs.forEach((el) => {
    el.addEventListener('input', () => checkValue(el));
    el.addEventListener('change', () => checkValue(el));
    checkValue(el); // initial state
  });

  const submitBtn = form.querySelector('.btn-submit');
  const statusEl = form.querySelector('.form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const lang = getLang();

    // Rate limit
    if (!canSubmitForm()) {
      showStatus(statusEl, 'error', messages[lang].rateLimit);
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: sanitizeInput(formData.get('name') || ''),
      email: sanitizeInput(formData.get('email') || ''),
      company: sanitizeInput(formData.get('company') || ''),
      message: sanitizeInput(formData.get('message') || ''),
      website: formData.get('website') || '', // honeypot
    };

    // Validate
    const { valid, errors } = validateContactForm(data);
    if (!valid) {
      const msg = errors.map(e => e.message).join(', ');
      showStatus(statusEl, 'error', msg);
      return;
    }

    // Submit
    setButtonState(submitBtn, 'loading');

    try {
      // Fetch CSRF token
      const tokenRes = await fetch('/api/contact');
      const { csrfToken } = await tokenRes.json();

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setButtonState(submitBtn, 'success');
        showStatus(statusEl, 'success', messages[lang].success);
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      setButtonState(submitBtn, 'error');
      showStatus(statusEl, 'error', messages[lang].error);
    }

    setTimeout(() => setButtonState(submitBtn, 'default'), 3000);
  });
}

function setButtonState(btn, state) {
  if (!btn) return;
  btn.classList.remove('is-loading', 'is-success', 'is-error');
  if (state === 'loading') btn.classList.add('is-loading');
  if (state === 'success') btn.classList.add('is-success');
  if (state === 'error') btn.classList.add('is-error');
}

function showStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = 'form-status show ' + type;
  setTimeout(() => {
    el.classList.remove('show');
  }, 5000);
}
