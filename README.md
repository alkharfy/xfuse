# Xfuse — Digital Solutions Studio

> We build mobile apps, web platforms, and enterprise systems that drive real business growth.

## Tech Stack

- **Build Tool:** Vite 6
- **CSS:** Vanilla CSS with Custom Properties + PostCSS (autoprefixer, cssnano)
- **JS:** Vanilla ES Modules
- **Animations:** GSAP 3.12 + ScrollTrigger (CDN)
- **Carousel:** Swiper 11 (CDN)
- **Fonts:** Cairo (Arabic), Syne (Display), Plus Jakarta Sans (Body), Space Mono (Mono)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
xfuse/
├── index.html              # Main entry point
├── 404.html                # Custom error page
├── src/
│   ├── css/                # Modular CSS (base, layout, components, themes, rtl, utilities)
│   ├── js/                 # ES Modules (core, components, effects, security)
│   ├── i18n/               # EN/AR translations
│   └── assets/             # Fonts, images, icons
├── public/                 # Static files (robots.txt, sitemap.xml, manifest.json)
├── server/                 # Backend API (contact form handler)
├── tests/                  # Automated tests (Lighthouse, a11y, security)
└── scripts/                # Build utilities (image optimization, font subsetting)
```

## Features

- 🌗 Dark/Light theme toggle with system preference detection
- 🌍 Bilingual (EN/AR) with full RTL support
- 📱 Fully responsive (mobile-first)
- ♿ Accessible (WCAG 2.1 AA, reduced-motion support)
- 🔒 Security headers, input sanitization, rate limiting
- ⚡ Performance optimized (< 500KB total, LCP < 2.5s)

## Deployment

Configured for **Vercel** deployment. See `vercel.json` for routing and headers.

```bash
npm run build
# Deploy dist/ folder
```

## License

MIT © 2026 Xfuse Digital Solutions
