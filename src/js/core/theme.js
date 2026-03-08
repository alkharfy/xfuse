/**
 * Xfuse — Theme Toggle (Dark/Light)
 */
export function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  if (!themeToggles.length) return;

  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('xfuse-theme');
  const theme = saved || (prefersDark ? 'dark' : 'light');

  root.dataset.theme = theme;
  themeToggles.forEach(btn => updateToggleIcon(btn, theme));

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = root.dataset.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('xfuse-theme', next);
      themeToggles.forEach(b => updateToggleIcon(b, next));
    });
  });
}

function updateToggleIcon(btn, theme) {
  const moon = btn.querySelector('.theme-toggle__icon--moon');
  const sun = btn.querySelector('.theme-toggle__icon--sun');
  if (moon && sun) {
    moon.style.display = theme === 'dark' ? 'none' : 'block';
    sun.style.display = theme === 'dark' ? 'block' : 'none';
  }
}
