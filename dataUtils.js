/**
 * dataUtils.js
 * Utility functions for loading and validating data.json.
 * Includes error handling for missing files, malformed JSON,
 * and invalid data shapes.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load and parse a JSON file from disk.
 * @param {string} filePath - Absolute or relative path to the JSON file.
 * @returns {object} Parsed JSON object.
 * @throws {Error} If the file does not exist, cannot be read, or is not valid JSON.
 */
function loadJSON(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  let raw;
  try {
    raw = fs.readFileSync(resolved, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read file "${resolved}": ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in "${resolved}": ${err.message}`);
  }

  return parsed;
}

/**
 * Validate that a data object conforms to the expected project data shape.
 * @param {object} data - The parsed data object.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateData(data) {
  const errors = [];

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push('Root value must be a non-null object.');
    return { valid: false, errors };
  }

  const requiredFields = ['project', 'version', 'description', 'author', 'items'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: "${field}".`);
    }
  }

  if ('items' in data) {
    if (!Array.isArray(data.items)) {
      errors.push('"items" must be an array.');
    } else {
      data.items.forEach((item, idx) => {
        if (typeof item.id !== 'number') {
          errors.push(`items[${idx}]: "id" must be a number.`);
        }
        if (typeof item.name !== 'string' || item.name.trim() === '') {
          errors.push(`items[${idx}]: "name" must be a non-empty string.`);
        }
        if (typeof item.active !== 'boolean') {
          errors.push(`items[${idx}]: "active" must be a boolean.`);
        }
      });
    }
  }

  if ('settings' in data && typeof data.settings === 'object' && data.settings !== null) {
    const { maxRetries, timeout } = data.settings;
    if (maxRetries !== undefined && (typeof maxRetries !== 'number' || maxRetries < 0)) {
      errors.push('"settings.maxRetries" must be a non-negative number.');
    }
    if (timeout !== undefined && (typeof timeout !== 'number' || timeout <= 0)) {
      errors.push('"settings.timeout" must be a positive number.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get only the active items from the data.
 * @param {object} data - Validated data object.
 * @returns {object[]} Array of active items.
 * @throws {Error} If data is invalid or items field is missing.
 */
function getActiveItems(data) {
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Cannot get active items: "data.items" is not an array.');
  }
  return data.items.filter(item => item.active === true);
}

module.exports = { loadJSON, validateData, getActiveItems };
