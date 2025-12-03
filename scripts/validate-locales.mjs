import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const REQUIRED_NAMESPACES = [
  'feedback',
  'common',
  'footer',
  'hero',
  'governance',
  'contact',
  'dashboard'
];

const LOCALES = ['en', 'de', 'fr', 'es', 'it', 'tr'];

console.log('🔍 Validating Locales...');

let hasError = false;

for (const locale of LOCALES) {
  const localeDir = path.join(LOCALES_DIR, locale);
  const indexFile = path.join(localeDir, 'index.ts');

  if (!fs.existsSync(localeDir)) {
    console.error(`❌ Locale directory missing: ${locale}`);
    hasError = true;
    continue;
  }

  if (!fs.existsSync(indexFile)) {
    console.error(`❌ Locale index missing: ${locale}/index.ts`);
    hasError = true;
    continue;
  }

  // Check JSON files
  for (const ns of REQUIRED_NAMESPACES) {
    const jsonFile = path.join(localeDir, `${ns}.json`);
    if (!fs.existsSync(jsonFile)) {
      console.error(`❌ Namespace file missing: ${locale}/${ns}.json`);
      hasError = true;
    }
  }

  // Basic check of index.ts content
  const indexContent = fs.readFileSync(indexFile, 'utf-8');
  
  for (const ns of REQUIRED_NAMESPACES) {
    if (!indexContent.includes(`import ${ns} from './${ns}.json'`)) {
       console.error(`❌ Namespace '${ns}' not imported in ${locale}/index.ts`);
       hasError = true;
    }
    
    // Check if exported (simple regex check for the key in the export object)
    // Matches "  feedback," or "  feedback: feedback," or "feedback" in export default
    // We search for the string "feedback," or "feedback" within the file, 
    // assuming if it's imported and the file compiles (checked by build/test), it's likely exported if present in the object.
    // To be more robust, we look for it after "export default".
    const exportDefaultIndex = indexContent.indexOf('export default {');
    if (exportDefaultIndex !== -1) {
        const exportBlock = indexContent.slice(exportDefaultIndex);
        if (!exportBlock.includes(ns)) {
             console.error(`❌ Namespace '${ns}' not exported in ${locale}/index.ts`);
             hasError = true;
        }
    }
  }
}

if (hasError) {
  console.error('\n❌ Validation failed.');
  process.exit(1);
} else {
  console.log('\n✅ All locales validated successfully.');
}

