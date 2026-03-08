/**
 * Xfuse — Accessibility Tests (axe-core)
 * Run: node tests/a11y.test.js
 * Requires: npm i -D @axe-core/cli
 */
import { execSync } from 'child_process';

const URL = 'http://localhost:3000';

async function runA11yTests() {
  console.log('♿ Running accessibility audit...\n');

  try {
    const output = execSync(`npx axe ${URL} --exit`, { encoding: 'utf-8' });
    console.log(output);

    if (output.includes('0 violations found')) {
      console.log('✅ No accessibility violations found!');
      process.exit(0);
    } else {
      console.log('❌ Accessibility violations detected.');
      process.exit(1);
    }
  } catch (err) {
    // axe-core exits with non-zero when violations found
    console.log(err.stdout || err.message);
    console.log('\n❌ Accessibility violations detected.');
    process.exit(1);
  }
}

runA11yTests();
