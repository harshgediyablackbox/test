/**
 * dataReader.js
 * Reads and validates data.json with robust error handling.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

/**
 * Reads and parses the data file.
 * @returns {{ data: object|null, error: string|null }}
 */
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { data: null, error: `File not found: ${DATA_FILE}` };
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf8');

    if (!raw || raw.trim().length === 0) {
      return { data: null, error: 'File is empty' };
    }

    const parsed = JSON.parse(raw);
    return { data: parsed, error: null };

  } catch (err) {
    if (err instanceof SyntaxError) {
      return { data: null, error: `JSON parse error: ${err.message}` };
    }
    return { data: null, error: `Unexpected error: ${err.message}` };
  }
}

/**
 * Returns all active items from the data file.
 * @returns {{ items: Array|null, error: string|null }}
 */
function getActiveItems() {
  const { data, error } = readData();

  if (error) {
    return { items: null, error };
  }

  if (!Array.isArray(data.items)) {
    return { items: null, error: 'data.items is not an array' };
  }

  const active = data.items.filter(item => {
    if (typeof item !== 'object' || item === null) return false;
    return item.active === true;
  });

  return { items: active, error: null };
}

module.exports = { readData, getActiveItems };
