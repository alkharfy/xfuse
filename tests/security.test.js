/**
 * Xfuse — Security Headers Validation
 * Checks that all required security headers are present
 * Run: node tests/security.test.js
 */

const URL = 'http://localhost:3000';

const REQUIRED_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
};

const RECOMMENDED_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'permissions-policy',
];

async function runSecurityTests() {
  console.log('🔒 Running security headers check...\n');

  try {
    const res = await fetch(URL);
    const headers = Object.fromEntries(res.headers.entries());
    let passed = true;

    // Required headers
    console.log('Required Headers:');
    for (const [header, expectedValue] of Object.entries(REQUIRED_HEADERS)) {
      const actual = headers[header];
      if (actual === expectedValue) {
        console.log(`  ✅ ${header}: ${actual}`);
      } else if (actual) {
        console.log(`  ⚠️  ${header}: ${actual} (expected: ${expectedValue})`);
      } else {
        console.log(`  ❌ ${header}: MISSING`);
        passed = false;
      }
    }

    // Recommended headers
    console.log('\nRecommended Headers:');
    for (const header of RECOMMENDED_HEADERS) {
      const actual = headers[header];
      if (actual) {
        console.log(`  ✅ ${header}: present`);
      } else {
        console.log(`  ⚠️  ${header}: MISSING (recommended for production)`);
      }
    }

    // Check no sensitive info leaked
    console.log('\nInformation Disclosure:');
    const serverHeader = headers['server'];
    const poweredBy = headers['x-powered-by'];
    console.log(`  ${serverHeader ? '⚠️  Server header exposed: ' + serverHeader : '✅ Server header hidden'}`);
    console.log(`  ${poweredBy ? '❌ X-Powered-By exposed: ' + poweredBy : '✅ X-Powered-By hidden'}`);

    console.log(`\n${passed ? '✅ All required security headers present!' : '❌ Some required headers missing.'}`);
    process.exit(passed ? 0 : 1);
  } catch (err) {
    console.error('Security test failed:', err.message);
    console.log('Make sure the dev server is running on', URL);
    process.exit(1);
  }
}

runSecurityTests();
