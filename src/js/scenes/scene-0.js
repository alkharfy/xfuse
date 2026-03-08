/**
 * Xfuse — Scene 0: "The Spark"
 * A dot of light grows, explodes into particles,
 * particles form the Xfuse logo, text reveals with blur effect,
 * logo shrinks and docks into the navbar.
 */
import { prefersReducedMotion } from '../core/utils.js';

// Canvas particle system
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.targetPositions = [];
    this.progress = 0; // 0 = burst, 1 = formed
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.w = this.canvas.offsetWidth;
    this.h = this.canvas.offsetHeight;
    this.cx = this.w / 2;
    this.cy = this.h / 2;
  }

  generateParticles(count = 120) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 250;
      this.particles.push({
        // Burst position (spread outward from center)
        burstX: this.cx + Math.cos(angle) * radius,
        burstY: this.cy + Math.sin(angle) * radius,
        // Current position
        x: this.cx,
        y: this.cy,
        // Logo target position (will be set)
        targetX: this.cx,
        targetY: this.cy,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
        delay: Math.random() * 0.3,
      });
    }
  }

  setLogoTargets() {
    // Create "Xfuse" text on an offscreen canvas to get pixel positions
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    const fontSize = Math.min(this.w * 0.15, 120);
    offscreen.width = this.w;
    offscreen.height = this.h;
    offCtx.fillStyle = '#fff';
    offCtx.font = `800 ${fontSize}px 'Syne', sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('Xfuse', this.w / 2, this.h / 2);

    const imageData = offCtx.getImageData(0, 0, this.w, this.h);
    const points = [];
    const step = 4; // Sample every 4th pixel

    for (let y = 0; y < this.h; y += step) {
      for (let x = 0; x < this.w; x += step) {
        const i = (y * this.w + x) * 4;
        if (imageData.data[i + 3] > 128) {
          points.push({ x, y });
        }
      }
    }

    // Assign target positions to particles
    const count = this.particles.length;
    for (let i = 0; i < count; i++) {
      if (points.length > 0) {
        const point = points[i % points.length];
        this.particles[i].targetX = point.x;
        this.particles[i].targetY = point.y;
      }
    }
  }

  update(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    for (const p of this.particles) {
      const t = Math.max(0, Math.min(1, (this.progress - p.delay) / (1 - p.delay)));
      const ease = t * t * (3 - 2 * t); // smoothstep

      if (this.progress < 0.1) {
        // Pre-burst: particles at center
        p.x = this.cx;
        p.y = this.cy;
      } else if (this.progress < 0.4) {
        // Burst phase: fly outward
        const burstT = (this.progress - 0.1) / 0.3;
        const burstEase = 1 - Math.pow(1 - burstT, 3);
        p.x = this.cx + (p.burstX - this.cx) * burstEase;
        p.y = this.cy + (p.burstY - this.cy) * burstEase;
      } else {
        // Formation phase: converge to logo
        const formT = Math.max(0, (this.progress - 0.4) / 0.6);
        const formEase = formT * formT * (3 - 2 * formT);
        p.x = p.burstX + (p.targetX - p.burstX) * formEase;
        p.y = p.burstY + (p.targetY - p.burstY) * formEase;
      }

      const alpha = this.progress < 0.05 ? this.progress / 0.05 * p.alpha : p.alpha;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      this.ctx.fill();
    }
  }
}

export function initScene0() {
  if (prefersReducedMotion() || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Show static version for reduced motion
    const scene = document.getElementById('scene-0');
    if (scene) scene.classList.add('scene--static');
    return;
  }

  const scene = document.getElementById('scene-0');
  if (!scene) return;

  const canvas = scene.querySelector('.scene0__canvas');
  const dot = scene.querySelector('.scene0__dot');
  const textEn = scene.querySelector('.scene0__text[data-lang="en"]');
  const textAr = scene.querySelector('.scene0__text[data-lang="ar"]');
  const logoText = scene.querySelector('.scene0__logo-text');

  if (!canvas || !dot) return;

  // Initialize particle system
  const ps = new ParticleSystem(canvas);
  ps.generateParticles(120);

  // Wait for fonts to load before calculating logo targets
  document.fonts.ready.then(() => {
    ps.setLogoTargets();
  });

  // Resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ps.resize();
      ps.setLogoTargets();
    }, 250);
  });

  // RAF loop for particle rendering
  let animFrame;
  function renderParticles() {
    ps.draw();
    animFrame = requestAnimationFrame(renderParticles);
  }

  // Start/stop rendering based on visibility
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animFrame) animFrame = requestAnimationFrame(renderParticles);
      } else {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    });
  }, { threshold: 0 });
  observer.observe(scene);

  // Scene 0 master timeline (scrub-linked)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: '+=200%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      anticipatePin: 1,
      id: 'scene-0',
      onEnter: () => {
        document.body.setAttribute('data-scene', '0');
        scene.classList.add('scene--active');
      },
      onLeave: () => {
        scene.classList.remove('scene--active');
      },
      onEnterBack: () => {
        document.body.setAttribute('data-scene', '0');
        scene.classList.add('scene--active');
      },
      onLeaveBack: () => {
        scene.classList.remove('scene--active');
      },
    },
  });

  // Phase 1: Dot grows and glows (0% - 15%)
  tl.fromTo(dot,
    { scale: 0.3, opacity: 0.5 },
    { scale: 8, opacity: 1, duration: 0.15, ease: 'power2.in' },
    0
  );

  // Phase 2: Dot explodes (becomes invisible, particles take over) (15% - 20%)
  tl.to(dot,
    { scale: 20, opacity: 0, duration: 0.05, ease: 'power2.out' },
    0.15
  );

  // Phase 3: Particle burst and formation (15% - 85%)
  // This is driven by updating canvas progress
  tl.to({ progress: 0 }, {
    progress: 1,
    duration: 0.7,
    ease: 'none',
    onUpdate: function () {
      ps.update(this.targets()[0].progress);
    },
  }, 0.15);

  // Phase 4: Text reveal with blur + clip-path (50% - 70%)
  const textLines = scene.querySelectorAll('.scene0__text-line');
  if (textEn) {
    tl.fromTo(textEn,
      { opacity: 0, filter: 'blur(20px)', y: 30 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.2, ease: 'power2.out' },
      0.5
    );
  }
  if (textAr) {
    tl.fromTo(textAr,
      { opacity: 0, filter: 'blur(20px)', y: 30 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.2, ease: 'power2.out' },
      0.5
    );
  }
  // Clip-path reveal on individual lines (staggered)
  if (textLines.length) {
    tl.to(textLines, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 0.15,
      stagger: 0.05,
      ease: 'power3.out',
    }, 0.52);
  }

  // Phase 5: Logo text fades in (65% - 80%)
  if (logoText) {
    tl.fromTo(logoText,
      { opacity: 0, scale: 1.2 },
      { opacity: 1, scale: 1, duration: 0.15, ease: 'power2.out' },
      0.65
    );
  }

  // Phase 6: Everything fades, background transitions to dark theme (85% - 100%)
  tl.to(canvas, {
    opacity: 0,
    duration: 0.15,
    ease: 'power2.inOut',
  }, 0.85);

  // Logo text shrinks and moves up toward nav
  if (logoText) {
    tl.to(logoText, {
      y: () => {
        const navLogo = document.querySelector('.nav__logo-text');
        if (!navLogo) return -window.innerHeight / 2;
        const navRect = navLogo.getBoundingClientRect();
        const logoRect = logoText.getBoundingClientRect();
        return navRect.top - logoRect.top;
      },
      x: () => {
        const navLogo = document.querySelector('.nav__logo-text');
        if (!navLogo) return 0;
        const navRect = navLogo.getBoundingClientRect();
        const logoRect = logoText.getBoundingClientRect();
        return navRect.left - logoRect.left;
      },
      scale: 0.3,
      opacity: 0,
      duration: 0.15,
      ease: 'power3.inOut',
    }, 0.85);
  }

  // Text fades out
  if (textEn) {
    tl.to(textEn, { opacity: 0, y: -20, duration: 0.1 }, 0.88);
  }
  if (textAr) {
    tl.to(textAr, { opacity: 0, y: -20, duration: 0.1 }, 0.88);
  }

  // Background reveal
  tl.fromTo(scene,
    { backgroundColor: '#000000' },
    { backgroundColor: 'var(--bg-primary)', duration: 0.15, ease: 'power2.inOut' },
    0.85
  );
}
