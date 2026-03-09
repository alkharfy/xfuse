// Xfuse — Main Entry Point

// Styles
import '../css/main.css';

// Core (always needed immediately)
import { initApp } from './core/app.js';
import { initTheme } from './core/theme.js';
import { initLanguage, refreshLanguage } from './core/language.js';
import { initRouter } from './core/router.js';

// Above-the-fold (Scene 0 + Nav + Preloader)
import { initScene0 } from './scenes/scene-0.js';
import { initNav } from './components/nav.js';
import { initPreloader } from './effects/preloader.js';
import { initCursor } from './effects/cursor.js';
import { initScrollProgress } from './effects/scroll-progress.js';

// Lazy-load below-fold modules
function lazyInit(importFn, exportName = 'default') {
  return () => importFn().then(m => {
    const fn = typeof exportName === 'string' ? m[exportName] : exportName(m);
    if (typeof fn === 'function') return fn();
  });
}

// requestIdleCallback polyfill for Safari
const rIC = window.requestIdleCallback || (cb => setTimeout(cb, 1));

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  // Critical: init immediately
  const critical = [
    ['Preloader', initPreloader],
    ['App', initApp],
    ['Theme', initTheme],
    ['Language', initLanguage],
    ['Router', initRouter],
    ['Scene0', initScene0],
    ['Nav', initNav],
    ['Cursor', initCursor],
    ['ScrollProgress', initScrollProgress],
  ];

  for (const [name, init] of critical) {
    try {
      const result = init();
      if (result && typeof result.catch === 'function') {
        result.catch(err => console.error(`[Xfuse] Failed to init ${name}:`, err));
      }
    } catch (err) {
      console.error(`[Xfuse] Failed to init ${name}:`, err);
    }
  }

  // Deferred: load after initial paint — sequential to ensure correct ScrollTrigger pin ordering
  rIC(() => {
    const deferred = [
      ['Scene1', lazyInit(() => import('./scenes/scene-1.js'), 'initScene1')],
      ['Scene2', lazyInit(() => import('./scenes/scene-2.js'), 'initScene2')],
      ['Scene3', lazyInit(() => import('./scenes/scene-3.js'), 'initScene3')],
      ['Scene4', lazyInit(() => import('./scenes/scene-4.js'), 'initScene4')],
      ['Offers', lazyInit(() => import('./scenes/scene-offers-faq.js'), 'initOffers')],
      ['Scene5', lazyInit(() => import('./scenes/scene-5.js'), 'initScene5')],
      ['Scene6', lazyInit(() => import('./scenes/scene-6.js'), 'initScene6')],
      ['FAQ', lazyInit(() => import('./scenes/scene-offers-faq.js'), 'initFaq')],
      ['Scene7', lazyInit(() => import('./scenes/scene-7.js'), 'initScene7')],
      ['ContactForm', lazyInit(() => import('./components/contact-form.js'), 'initContactForm')],
      ['Magnetic', lazyInit(() => import('./effects/magnetic.js'), 'initMagnetic')],
      ['BackToTop', lazyInit(() => import('./effects/back-to-top.js'), 'initBackToTop')],
      ['Tilt', lazyInit(() => import('./effects/tilt.js'), 'initTilt')],
      ['PortfolioParallax', lazyInit(() => import('./effects/portfolio-parallax.js'), 'initPortfolioParallax')],
    ];

    // Initialize sequentially so each ScrollTrigger pin is created in DOM order
    // This prevents pin spacing overlap caused by concurrent async inits
    (async () => {
      for (const [name, init] of deferred) {
        try {
          await init();
        } catch (err) {
          console.error(`[Xfuse] Failed to init ${name}:`, err);
        }
      }
      // Re-apply language visibility to dynamically loaded content
      refreshLanguage();
      // Recalculate all ScrollTrigger positions after all scenes (including async data loads) finish
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    })();
  }, { timeout: 2000 });
});
