/**
 * Xfuse — Image Optimization Script
 * Converts images to WebP, generates thumbnails, and compresses
 * Run: node scripts/optimize-images.js
 * Requires: npm i -D sharp
 */
import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

async function optimizeImages() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('❌ sharp is not installed. Run: npm i -D sharp');
    process.exit(1);
  }

  const INPUT_DIR = 'src/assets/images';
  const OUTPUT_DIR = 'src/assets/images/optimized';
  const THUMB_WIDTH = 400;
  const FULL_WIDTH = 1200;
  const QUALITY = 80;

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const subdirs = ['portfolio', 'team', 'clients', 'og', 'misc'];

  for (const subdir of subdirs) {
    const inputPath = join(INPUT_DIR, subdir);
    if (!existsSync(inputPath)) continue;

    const outputPath = join(OUTPUT_DIR, subdir);
    if (!existsSync(outputPath)) mkdirSync(outputPath, { recursive: true });

    const files = readdirSync(inputPath).filter(f =>
      ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(extname(f).toLowerCase())
    );

    for (const file of files) {
      const name = basename(file, extname(file));
      const inputFile = join(inputPath, file);

      // Skip SVG files (already optimized)
      if (extname(file).toLowerCase() === '.svg') continue;

      try {
        // Full-size WebP
        await sharp(inputFile)
          .resize(FULL_WIDTH, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(join(outputPath, `${name}.webp`));

        // Thumbnail
        await sharp(inputFile)
          .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY - 10 })
          .toFile(join(outputPath, `${name}-thumb.webp`));

        console.log(`  ✅ ${subdir}/${file} → WebP + thumbnail`);
      } catch (err) {
        console.log(`  ❌ ${subdir}/${file}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Image optimization complete!');
}

optimizeImages();
