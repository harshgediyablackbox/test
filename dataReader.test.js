/**
 * dataReader.test.js
 * Tests for dataReader.js — uses Node's built-in assert (no test framework needed).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Temporarily swap the real data file path for isolated tests
const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_FILE = path.join(__dirname, 'data.json.bak');

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

function backup() {
  if (fs.existsSync(DATA_FILE)) {
    fs.copyFileSync(DATA_FILE, BACKUP_FILE);
  }
}

function restore() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, DATA_FILE);
    fs.unlinkSync(BACKUP_FILE);
  }
}

// ─── Suite: readData ────────────────────────────────────────────────────────

console.log('\nreadData()');

test('returns parsed data when file exists and is valid JSON', () => {
  const { readData } = require('./dataReader');
  const { data, error } = readData();
  assert.strictEqual(error, null, `Expected no error, got: ${error}`);
  assert.ok(data !== null, 'Expected data to be non-null');
  assert.strictEqual(data.project, 'test');
  assert.strictEqual(data.version, '1.0.0');
});

test('returns an error when data.json contains invalid JSON', () => {
  backup();
  fs.writeFileSync(DATA_FILE, '{ this is not valid json }', 'utf8');
  // Clear require cache so the module re-reads the file
  delete require.cache[require.resolve('./dataReader')];
  const { readData } = require('./dataReader');
  const { data, error } = readData();
  restore();
  delete require.cache[require.resolve('./dataReader')];
  assert.strictEqual(data, null, 'Expected data to be null on parse error');
  assert.ok(error.includes('JSON parse error'), `Expected JSON parse error, got: ${error}`);
});

test('returns an error when data.json is empty', () => {
  backup();
  fs.writeFileSync(DATA_FILE, '', 'utf8');
  delete require.cache[require.resolve('./dataReader')];
  const { readData } = require('./dataReader');
  const { data, error } = readData();
  restore();
  delete require.cache[require.resolve('./dataReader')];
  assert.strictEqual(data, null, 'Expected data to be null for empty file');
  assert.ok(error.includes('empty'), `Expected empty-file error, got: ${error}`);
});

test('returns an error when data.json does not exist', () => {
  backup();
  fs.unlinkSync(DATA_FILE);
  delete require.cache[require.resolve('./dataReader')];
  const { readData } = require('./dataReader');
  const { data, error } = readData();
  restore();
  delete require.cache[require.resolve('./dataReader')];
  assert.strictEqual(data, null, 'Expected data to be null when file missing');
  assert.ok(error.includes('not found'), `Expected not-found error, got: ${error}`);
});

// ─── Suite: getActiveItems ──────────────────────────────────────────────────

console.log('\ngetActiveItems()');

test('returns only active items from valid data', () => {
  delete require.cache[require.resolve('./dataReader')];
  const { getActiveItems } = require('./dataReader');
  const { items, error } = getActiveItems();
  assert.strictEqual(error, null, `Expected no error, got: ${error}`);
  assert.ok(Array.isArray(items), 'Expected items to be an array');
  assert.ok(items.every(i => i.active === true), 'All returned items should be active');
  assert.strictEqual(items.length, 2, 'Expected 2 active items from fixture');
});

test('returns an error when items field is missing', () => {
  backup();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ project: 'no-items' }), 'utf8');
  delete require.cache[require.resolve('./dataReader')];
  const { getActiveItems } = require('./dataReader');
  const { items, error } = getActiveItems();
  restore();
  delete require.cache[require.resolve('./dataReader')];
  assert.strictEqual(items, null, 'Expected items to be null');
  assert.ok(error.includes('not an array'), `Expected array error, got: ${error}`);
});

test('propagates readData error when file is corrupt', () => {
  backup();
  fs.writeFileSync(DATA_FILE, 'CORRUPT', 'utf8');
  delete require.cache[require.resolve('./dataReader')];
  const { getActiveItems } = require('./dataReader');
  const { items, error } = getActiveItems();
  restore();
  delete require.cache[require.resolve('./dataReader')];
  assert.strictEqual(items, null, 'Expected items to be null on corrupt file');
  assert.ok(typeof error === 'string' && error.length > 0, 'Expected a non-empty error string');
});

// ─── Results ────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
