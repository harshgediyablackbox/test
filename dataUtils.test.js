/**
 * dataUtils.test.js
 * Simple test suite for dataUtils.js using Node.js built-in assert.
 * Run with: node dataUtils.test.js
 */

const assert = require('assert');
const path = require('path');
const { loadJSON, validateData, getActiveItems } = require('./dataUtils');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  PASS  ${description}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${description}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// loadJSON
// ---------------------------------------------------------------------------
console.log('\nloadJSON');

test('loads a valid JSON file without throwing', () => {
  const data = loadJSON(path.join(__dirname, 'data.json'));
  assert.strictEqual(typeof data, 'object');
  assert.strictEqual(data.project, 'test');
});

test('throws when the file does not exist', () => {
  assert.throws(
    () => loadJSON('/nonexistent/path/missing.json'),
    /File not found/
  );
});

test('throws on malformed JSON', () => {
  const fs = require('fs');
  const tmpPath = '/tmp/bad.json';
  fs.writeFileSync(tmpPath, '{ "broken": true,, }');
  assert.throws(
    () => loadJSON(tmpPath),
    /Invalid JSON/
  );
  fs.unlinkSync(tmpPath);
});

// ---------------------------------------------------------------------------
// validateData
// ---------------------------------------------------------------------------
console.log('\nvalidateData');

const validData = {
  project: 'test',
  version: '1.0.0',
  description: 'Sample',
  author: 'alice',
  items: [
    { id: 1, name: 'Alpha', active: true },
    { id: 2, name: 'Beta',  active: false },
  ],
  settings: { maxRetries: 3, timeout: 5000 },
};

test('returns valid=true for a well-formed data object', () => {
  const result = validateData(validData);
  assert.strictEqual(result.valid, true);
  assert.deepStrictEqual(result.errors, []);
});

test('returns valid=false when a required field is missing', () => {
  const { author, ...noAuthor } = validData;
  const result = validateData(noAuthor);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('"author"')));
});

test('returns valid=false when items is not an array', () => {
  const result = validateData({ ...validData, items: 'oops' });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('"items" must be an array')));
});

test('returns error when an item has a non-number id', () => {
  const badItems = [{ id: 'x', name: 'Bad', active: true }];
  const result = validateData({ ...validData, items: badItems });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('"id" must be a number')));
});

test('returns error when an item has an empty name', () => {
  const badItems = [{ id: 1, name: '  ', active: true }];
  const result = validateData({ ...validData, items: badItems });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('"name" must be a non-empty string')));
});

test('returns error when settings.timeout is not positive', () => {
  const result = validateData({ ...validData, settings: { maxRetries: 3, timeout: -1 } });
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('"settings.timeout"')));
});

test('returns valid=false for null input', () => {
  const result = validateData(null);
  assert.strictEqual(result.valid, false);
});

// ---------------------------------------------------------------------------
// getActiveItems
// ---------------------------------------------------------------------------
console.log('\ngetActiveItems');

test('returns only active items', () => {
  const actives = getActiveItems(validData);
  assert.strictEqual(actives.length, 1);
  assert.strictEqual(actives[0].name, 'Alpha');
});

test('returns empty array when no items are active', () => {
  const data = { ...validData, items: [{ id: 1, name: 'X', active: false }] };
  const actives = getActiveItems(data);
  assert.deepStrictEqual(actives, []);
});

test('throws when items field is missing', () => {
  assert.throws(
    () => getActiveItems({ project: 'test' }),
    /Cannot get active items/
  );
});

test('throws when data is null', () => {
  assert.throws(
    () => getActiveItems(null),
    /Cannot get active items/
  );
});

// ---------------------------------------------------------------------------
// Integration: load real data.json and validate it
// ---------------------------------------------------------------------------
console.log('\nIntegration');

test('data.json loads and validates successfully', () => {
  const data = loadJSON(path.join(__dirname, 'data.json'));
  const result = validateData(data);
  assert.strictEqual(result.valid, true, `Validation errors: ${result.errors.join(', ')}`);
});

test('data.json contains 2 active items out of 3', () => {
  const data = loadJSON(path.join(__dirname, 'data.json'));
  const actives = getActiveItems(data);
  assert.strictEqual(actives.length, 2);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) {
  process.exit(1);
}
