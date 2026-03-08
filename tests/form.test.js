/**
 * Xfuse — Contact Form Validation Tests
 * Run: node tests/form.test.js
 */
import { validateContactForm } from '../server/middleware/validator.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

console.log('📝 Contact Form Validation Tests\n');

// Valid submissions
test('accepts valid complete form', () => {
  const result = validateContactForm({
    name: 'Ahmed',
    email: 'ahmed@example.com',
    company: 'Xfuse',
    message: 'Hello, I need a website built for my company.',
  });
  assert(result.valid, 'Should be valid');
  assert(result.errors.length === 0, 'Should have no errors');
});

test('accepts form without company (optional)', () => {
  const result = validateContactForm({
    name: 'Ahmed',
    email: 'ahmed@example.com',
    company: '',
    message: 'Hello, I need a website built.',
  });
  assert(result.valid, 'Should be valid');
});

// Name validation
test('rejects empty name', () => {
  const result = validateContactForm({ name: '', email: 'a@b.com', message: 'Hello world test' });
  assert(!result.valid, 'Should be invalid');
  assert(result.errors.some(e => e.field === 'name'), 'Should have name error');
});

test('rejects name too short', () => {
  const result = validateContactForm({ name: 'A', email: 'a@b.com', message: 'Hello world test' });
  assert(!result.valid, 'Should be invalid');
});

test('rejects name too long', () => {
  const result = validateContactForm({ name: 'A'.repeat(101), email: 'a@b.com', message: 'Hello world test' });
  assert(!result.valid, 'Should be invalid');
});

// Email validation
test('rejects invalid email', () => {
  const result = validateContactForm({ name: 'Ahmed', email: 'not-an-email', message: 'Hello world test' });
  assert(!result.valid, 'Should be invalid');
  assert(result.errors.some(e => e.field === 'email'), 'Should have email error');
});

test('rejects empty email', () => {
  const result = validateContactForm({ name: 'Ahmed', email: '', message: 'Hello world test' });
  assert(!result.valid, 'Should be invalid');
});

// Message validation
test('rejects short message', () => {
  const result = validateContactForm({ name: 'Ahmed', email: 'a@b.com', message: 'Hi' });
  assert(!result.valid, 'Should be invalid');
  assert(result.errors.some(e => e.field === 'message'), 'Should have message error');
});

test('rejects message too long', () => {
  const result = validateContactForm({ name: 'Ahmed', email: 'a@b.com', message: 'A'.repeat(5001) });
  assert(!result.valid, 'Should be invalid');
});

// XSS prevention
test('sanitizes HTML in name', () => {
  const result = validateContactForm({
    name: '<script>alert("xss")</script>Ahmed',
    email: 'a@b.com',
    message: 'Normal message here',
  });
  assert(result.sanitized.name.includes('&lt;script&gt;'), 'Should escape HTML');
});

// Null/undefined body
test('rejects null body', () => {
  const result = validateContactForm(null);
  assert(!result.valid, 'Should be invalid');
});

test('rejects undefined body', () => {
  const result = validateContactForm(undefined);
  assert(!result.valid, 'Should be invalid');
});

// Summary
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed.');
process.exit(failed === 0 ? 0 : 1);
