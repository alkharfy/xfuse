/**
 * Xfuse — Sitemap Generator
 * Generates sitemap.xml from site configuration
 * Run: node scripts/generate-sitemap.js
 */
import { writeFileSync } from 'fs';

const DOMAIN = 'https://xfuse.dev';
const OUTPUT = 'public/sitemap.xml';

const pages = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const urls = pages.map(page => `  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  writeFileSync(OUTPUT, sitemap, 'utf-8');
  console.log(`✅ Sitemap generated: ${OUTPUT}`);
  console.log(`   ${pages.length} URL(s) — Last modified: ${today}`);
}

generateSitemap();
