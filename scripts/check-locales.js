const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const locales = ['en', 'de', 'tr'];

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object') {
      keys.push(...getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

let referenceKeys = null;
let hasError = false;

locales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    hasError = true;
    return;
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keys = getKeys(content);

  if (!referenceKeys) {
    referenceKeys = keys;
  } else {
    const missing = referenceKeys.filter(k => !keys.includes(k));
    const extra = keys.filter(k => !referenceKeys.includes(k));

    if (missing.length > 0) {
      console.error(`Missing keys in ${locale}:`, missing);
      hasError = true;
    }
    if (extra.length > 0) {
      console.error(`Extra keys in ${locale}:`, extra);
      hasError = true;
    }
  }
});

process.exit(hasError ? 1 : 0);
