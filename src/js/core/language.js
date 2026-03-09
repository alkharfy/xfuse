/**
 * Xfuse — Language Toggle (EN/AR)
 */
export function initLanguage() {
  const langToggles = document.querySelectorAll('.lang-toggle');
  if (!langToggles.length) return;

  const root = document.documentElement;
  const savedLang = localStorage.getItem('xfuse-lang') || 'en';
  setLanguage(savedLang);

  langToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = root.lang;
      const next = current === 'en' ? 'ar' : 'en';
      setLanguage(next);
      localStorage.setItem('xfuse-lang', next);
    });
  });

  function setLanguage(lang) {
    root.lang = lang;
    root.setAttribute('data-lang', lang);
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // Toggle bilingual content visibility via attribute
    document.querySelectorAll('[data-lang]:not(html)').forEach(el => {
      if (el.dataset.lang === lang) {
        el.setAttribute('data-lang-active', '');
      } else {
        el.removeAttribute('data-lang-active');
      }
    });

    // Update toggle button text
    const label = lang === 'en' ? 'العربية' : 'English';
    langToggles.forEach(btn => { btn.textContent = label; });
  }
}

/** Re-apply data-lang-active to all current [data-lang] elements (call after dynamic content loads) */
export function refreshLanguage() {
  const lang = document.documentElement.lang || 'en';
  document.querySelectorAll('[data-lang]:not(html)').forEach(el => {
    if (el.dataset.lang === lang) {
      el.setAttribute('data-lang-active', '');
    } else {
      el.removeAttribute('data-lang-active');
    }
  });
}
