/**
 * Xfuse — Font Subsetting Script
 * Subsets fonts to only include used characters for smaller file size
 * Run: node scripts/subset-fonts.js
 * Requires: npm i -D subset-font
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

async function subsetFonts() {
  let subsetFont;
  try {
    subsetFont = (await import('subset-font')).default;
  } catch {
    console.error('❌ subset-font is not installed. Run: npm i -D subset-font');
    process.exit(1);
  }

  const FONT_DIR = 'src/assets/fonts';
  const OUTPUT_DIR = 'src/assets/fonts/subset';
  const HTML_FILE = 'index.html';

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Collect all text from HTML
  const htmlContent = readFileSync(HTML_FILE, 'utf-8');
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  const uniqueChars = [...new Set(textContent)].join('');

  console.log(`📝 Found ${uniqueChars.length} unique characters\n`);

  const fontDirs = readdirSync(FONT_DIR).filter(f => {
    const fullPath = join(FONT_DIR, f);
    try { return readdirSync(fullPath).length > 0; } catch { return false; }
  });

  for (const dir of fontDirs) {
    const fontPath = join(FONT_DIR, dir);
    const files = readdirSync(fontPath).filter(f => extname(f) === '.woff2');

    for (const file of files) {
      const inputPath = join(fontPath, file);
      const outputPath = join(OUTPUT_DIR, file);

      try {
        const fontBuffer = readFileSync(inputPath);
        const subset = await subsetFont(fontBuffer, uniqueChars, { targetFormat: 'woff2' });
        writeFileSync(outputPath, subset);

        const originalSize = (fontBuffer.length / 1024).toFixed(1);
        const subsetSize = (subset.length / 1024).toFixed(1);
        const savings = (100 - (subset.length / fontBuffer.length) * 100).toFixed(0);

        console.log(`  ✅ ${file}: ${originalSize}KB → ${subsetSize}KB (${savings}% smaller)`);
      } catch (err) {
        console.log(`  ❌ ${file}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Font subsetting complete!');
}

subsetFonts();
