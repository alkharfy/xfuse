// Xfuse — Main Entry Point

// Styles
import '../css/main.css';

// Core
import { initApp } from './core/app.js';
import { initTheme } from './core/theme.js';
import { initLanguage } from './core/language.js';
import { initRouter } from './core/router.js';

// Scenes
import { initScene0 } from './scenes/scene-0.js';
import { initScene1 } from './scenes/scene-1.js';
import { initScene2 } from './scenes/scene-2.js';
import { initScene3 } from './scenes/scene-3.js';
import { initScene4 } from './scenes/scene-4.js';
import { initScene5 } from './scenes/scene-5.js';
import { initScene6 } from './scenes/scene-6.js';
import { initScene7 } from './scenes/scene-7.js';
import { initOffers, initFaq } from './scenes/scene-offers-faq.js';

// Components
import { initNav } from './components/nav.js';
import { initContactForm } from './components/contact-form.js';

// Effects
import { initCursor } from './effects/cursor.js';
import { initMagnetic } from './effects/magnetic.js';
import { initScrollProgress } from './effects/scroll-progress.js';
import { initBackToTop } from './effects/back-to-top.js';
import { initPreloader } from './effects/preloader.js';
import { initTilt } from './effects/tilt.js';
import { initPortfolioParallax } from './effects/portfolio-parallax.js';

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  const modules = [
    ['Preloader', initPreloader],
    ['App', initApp],
    ['Theme', initTheme],
    ['Language', initLanguage],
    ['Router', initRouter],
    ['Scene0', initScene0],
    ['Scene1', initScene1],
    ['Scene2', initScene2],
    ['Scene3', initScene3],
    ['Scene4', initScene4],
    ['Offers', initOffers],
    ['Scene5', initScene5],
    ['Scene6', initScene6],
    ['FAQ', initFaq],
    ['Scene7', initScene7],
    ['Nav', initNav],
    ['ContactForm', initContactForm],
    ['Cursor', initCursor],
    ['Magnetic', initMagnetic],
    ['ScrollProgress', initScrollProgress],
    ['BackToTop', initBackToTop],
    ['Tilt', initTilt],
    ['PortfolioParallax', initPortfolioParallax],
  ];

  for (const [name, init] of modules) {
    try {
      const result = init();
      if (result && typeof result.catch === 'function') {
        result.catch(err => console.error(`[Xfuse] Failed to init ${name}:`, err));
      }
    } catch (err) {
      console.error(`[Xfuse] Failed to init ${name}:`, err);
    }
  }
});
