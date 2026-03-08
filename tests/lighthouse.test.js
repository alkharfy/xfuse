/**
 * Xfuse — Lighthouse Performance Tests
 * Run: npx lighthouse http://localhost:3000 --output json --output-path ./lighthouse-report.json
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const URL = 'http://localhost:3000';
const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
};

async function runLighthouse() {
  console.log('🔍 Running Lighthouse audit...\n');

  try {
    execSync(
      `npx lighthouse ${URL} --chrome-flags="--headless --no-sandbox" --output json --output-path ./lighthouse-report.json --quiet`,
      { stdio: 'pipe' }
    );

    const report = JSON.parse(readFileSync('./lighthouse-report.json', 'utf-8'));
    const categories = report.categories;
    let passed = true;

    for (const [key, threshold] of Object.entries(THRESHOLDS)) {
      const score = Math.round((categories[key]?.score || 0) * 100);
      const status = score >= threshold ? '✅' : '❌';
      if (score < threshold) passed = false;
      console.log(`${status} ${key}: ${score}/100 (threshold: ${threshold})`);
    }

    // Performance budget checks
    const lcp = report.audits['largest-contentful-paint']?.numericValue || 0;
    const cls = report.audits['cumulative-layout-shift']?.numericValue || 0;
    const tbt = report.audits['total-blocking-time']?.numericValue || 0;

    console.log(`\n📊 Core Web Vitals:`);
    console.log(`  LCP: ${(lcp / 1000).toFixed(2)}s (budget: < 2.5s)`);
    console.log(`  CLS: ${cls.toFixed(3)} (budget: < 0.1)`);
    console.log(`  TBT: ${Math.round(tbt)}ms (budget: < 200ms)`);

    console.log(`\n${passed ? '✅ All thresholds passed!' : '❌ Some thresholds failed.'}`);
    process.exit(passed ? 0 : 1);
  } catch (err) {
    console.error('Lighthouse test failed:', err.message);
    process.exit(1);
  }
}

runLighthouse();
