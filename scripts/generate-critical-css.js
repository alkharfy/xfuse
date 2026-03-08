/**
 * Xfuse — Critical CSS Generator
 * Extracts above-the-fold CSS for inline embedding
 * Run: node scripts/generate-critical-css.js
 * Requires: npm i -D critical
 */
import { readFileSync, writeFileSync } from 'fs';

async function generateCriticalCSS() {
  let critical;
  try {
    critical = await import('critical');
  } catch {
    console.error('❌ critical is not installed. Run: npm i -D critical');
    process.exit(1);
  }

  console.log('⚡ Generating critical CSS...\n');

  try {
    const { css, html } = await critical.generate({
      src: 'dist/index.html',
      width: 1300,
      height: 900,
      inline: true,
      extract: true,
      penthouse: {
        blockJSRequests: false,
      },
    });

    if (css) {
      writeFileSync('dist/assets/css/critical.css', css, 'utf-8');
      console.log(`  ✅ Critical CSS extracted: ${(css.length / 1024).toFixed(1)}KB`);
    }

    if (html) {
      writeFileSync('dist/index.html', html, 'utf-8');
      console.log('  ✅ Critical CSS inlined in HTML');
    }

    console.log('\n✅ Critical CSS generation complete!');
  } catch (err) {
    console.error('❌ Critical CSS generation failed:', err.message);
    process.exit(1);
  }
}

generateCriticalCSS();
