/**
 * Xfuse — Scene Manager
 * Sets up ScrollTrigger pinning for each scene in DOM order.
 * Uses function-based values for safe responsive behavior.
 */
import { prefersReducedMotion } from './utils.js';

const scenes = [];
let currentScene = 0;

export function getCurrentScene() {
  return currentScene;
}

export function initSceneManager() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const sceneElements = document.querySelectorAll('.scene');
  if (!sceneElements.length) return;

  // Create ScrollTrigger for each scene in DOM order
  sceneElements.forEach((scene, index) => {
    const scrollDuration = scene.dataset.scrollDuration || '100%';

    const trigger = ScrollTrigger.create({
      trigger: scene,
      start: 'top top',
      end: () => `+=${scrollDuration}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 1,
      id: `scene-${index}`,
      onEnter: () => {
        currentScene = index;
        document.body.setAttribute('data-scene', index);
        scene.classList.add('scene--active');
      },
      onEnterBack: () => {
        currentScene = index;
        document.body.setAttribute('data-scene', index);
        scene.classList.add('scene--active');
      },
      onLeave: () => {
        scene.classList.remove('scene--active');
      },
      onLeaveBack: () => {
        scene.classList.remove('scene--active');
      },
    });

    scenes.push({ element: scene, trigger, index });
  });

  // Set initial scene
  document.body.setAttribute('data-scene', '0');

  // Refresh after all scene triggers are created (DOM order safe)
  ScrollTrigger.refresh();
}
