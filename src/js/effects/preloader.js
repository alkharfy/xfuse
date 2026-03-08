/**
 * Xfuse — Preloader
 * Hides the loading screen once fonts + GSAP are ready.
 */
export function initPreloader() {
  const el = document.getElementById('preloader');
  if (!el) return;

  const hide = () => {
    el.classList.add('preloader--done');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  };

  // Wait for fonts + a minimum delay for the fill animation
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const minDelay = new Promise(r => setTimeout(r, 1800));

  Promise.all([fontsReady, minDelay]).then(hide);
}
