import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// CONFIGURATION
const TARGET_DIR = process.argv[2] || 'governance/ledger';
const DRY_RUN = process.argv.includes('--dry-run');
const FIX = process.argv.includes('--fix');
const REPORT = process.argv.includes('--report');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ABS_TARGET_DIR = path.resolve(process.cwd(), TARGET_DIR);
const REPORT_FILE = path.join(ABS_TARGET_DIR, 'validation-report.json');

// ANSI Colors
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// LOGGING HELPERS
const log = (msg) => console.log(msg);
const info = (msg) => console.log(`${COLORS.blue}[INFO]${COLORS.reset} ${msg}`);
const success = (msg) => console.log(`${COLORS.green}[SUCCESS]${COLORS.reset} ${msg}`);
const warn = (msg) => console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${msg}`);
const error = (msg) => console.error(`${COLORS.red}[ERROR]${COLORS.reset} ${msg}`);

async function main() {
  info(`Starting Ledger Normalization...`);
  info(`Target Directory: ${ABS_TARGET_DIR}`);
  info(`Mode: ${FIX ? 'FIX (Write changes)' : 'VALIDATE (Read-only)'}`);
  if (DRY_RUN) info(`Dry Run: ENABLED (No changes will be written)`);
  if (REPORT) info(`Report: ENABLED (Writing to ${REPORT_FILE})`);

  if (!FIX && !DRY_RUN) {
    info('Running in validation mode. Use --fix to apply changes.');
  }

  try {
    const files = await fs.readdir(ABS_TARGET_DIR);
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));

    if (jsonlFiles.length === 0) {
      warn('No .jsonl files found in target directory.');
      process.exit(0);
    }

    let totalErrors = 0;
    let totalModified = 0;
    const reportData = {
        timestamp: new Date().toISOString(),
        totalFiles: jsonlFiles.length,
        totalErrors: 0,
        status: 'pass',
        files: []
    };

    for (const file of jsonlFiles) {
      const filePath = path.join(ABS_TARGET_DIR, file);
      const { errorCount, modifiedCount } = await processFile(filePath);
      totalErrors += errorCount;
      totalModified += modifiedCount;

      reportData.files.push({
          file,
          errors: errorCount,
          modified: modifiedCount,
          status: errorCount === 0 ? 'valid' : 'invalid'
      });
    }

    reportData.totalErrors = totalErrors;
    reportData.status = totalErrors === 0 ? 'valid' : 'invalid';

    if (REPORT && !DRY_RUN) {
        await fs.writeFile(REPORT_FILE, JSON.stringify(reportData, null, 2), 'utf-8');
        success(`Validation report written to ${REPORT_FILE}`);
    }

    console.log('-'.repeat(50));
    if (totalErrors > 0) {
      error(`Run completed with ${totalErrors} validation errors.`);
      if (!FIX) {
        info('Run with --fix to automatically resolve normalizable errors.');
      }
      process.exit(1);
    } else {
      success('All files passed validation.');
      process.exit(0);
    }

  } catch (err) {
    error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

async function processFile(filePath) {
  const filename = path.basename(filePath);
  // info(`Processing ${filename}...`);
  let errorCount = 0;
  let modifiedCount = 0;

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // DETECT AND HANDLE MULTI-LINE JSON (NON-STANDARD JSONL)
    let isMultiLineJson = false;
    try {
      const fullJson = JSON.parse(content);
      if (fullJson && typeof fullJson === 'object' && !Array.isArray(fullJson)) {
        // It's a single JSON object spread across lines
        info(`${filename}: Detected multi-line JSON. Converting to standard JSONL.`);
        // Wrap in array to process as single line
        return await processEntries([fullJson], filename, filePath);
      }
    } catch (e) {
      // Not a single JSON object, proceed with line-by-line
    }

    const lines = content.split('\n');
    const newLines = [];
    let lineNum = 0;

    for (const line of lines) {
      lineNum++;
      if (!line.trim()) {
        newLines.push(line);
        continue;
      }

      let entry;
      try {
        entry = JSON.parse(line);
      } catch (e) {
        error(`${filename}:${lineNum} - Invalid JSON`);
        errorCount++;
        newLines.push(line);
        continue;
      }

      // Check if entry is an object
      if (typeof entry !== 'object' || entry === null) {
        error(`${filename}:${lineNum} - Valid JSON but not an object (type: ${typeof entry})`);
        errorCount++;
        newLines.push(line);
        continue;
      }

      const { modified, finalEntry, errors } = normalizeEntry(entry, filename, lineNum);
      
      if (errors.length > 0) {
        errors.forEach(e => {
            if (e.level === 'warn') warn(e.msg);
            else { error(e.msg); errorCount++; }
        });
      }

      if (FIX) {
        newLines.push(JSON.stringify(finalEntry));
        if (modified) modifiedCount++;
      } else {
         // In validate mode, errors were already logged
      }
    }

    if (FIX && modifiedCount > 0) {
      if (DRY_RUN) {
        info(`${filename}: Would modify ${modifiedCount} lines.`);
      } else {
        const output = newLines.join('\n');
        await fs.writeFile(filePath, output, 'utf-8');
        success(`${filename}: Updated ${modifiedCount} lines.`);
      }
    }

    return { errorCount, modifiedCount };

  } catch (err) {
    error(`Failed to process ${filename}: ${err.message}`);
    return { errorCount: 1, modifiedCount: 0 };
  }
}

// Helper to process a list of entries (used for multi-line JSON conversion case)
async function processEntries(entries, filename, filePath) {
    let modifiedCount = 0;
    let errorCount = 0;
    const newLines = [];

    let lineNum = 0;
    for (const entry of entries) {
        lineNum++;
        const { modified, finalEntry, errors } = normalizeEntry(entry, filename, lineNum);
        
        if (errors.length > 0) {
            errors.forEach(e => {
                if (e.level === 'warn') warn(e.msg);
                else { error(e.msg); errorCount++; }
            });
        }

        if (FIX) {
            newLines.push(JSON.stringify(finalEntry));
            if (modified) modifiedCount++;
        }
    }

    if (FIX && modifiedCount > 0) { 
        if (DRY_RUN) {
            info(`${filename}: Would flatten and modify ${modifiedCount} entries.`);
        } else {
             const output = newLines.join('\n');
             await fs.writeFile(filePath, output, 'utf-8');
             success(`${filename}: Flattened and updated.`);
        }
    } else if (FIX) {
         // Even if no schema changes, we flatten it to valid JSONL
         if (DRY_RUN) info(`${filename}: Would flatten to valid JSONL.`);
         else {
             const output = newLines.join('\n');
             await fs.writeFile(filePath, output, 'utf-8');
             success(`${filename}: Flattened to valid JSONL.`);
         }
    }
    return { errorCount, modifiedCount };
}

function normalizeEntry(entry, filename, lineNum) {
      let modified = false;
      const errors = [];

      // 1. Normalize Author
      if (!entry.author) {
        if (entry.responsible) {
          entry.author = entry.responsible;
          delete entry.responsible;
          modified = true;
        } else if (Array.isArray(entry.signers) && entry.signers.length > 0) {
          entry.author = entry.signers.map(s => s.name || s.alias || 'Unknown').join(', ');
          modified = true;
        } else if (Array.isArray(entry.responsibleRoles) && entry.responsibleRoles.length > 0) {
          entry.author = entry.responsibleRoles.join(', ');
          delete entry.responsibleRoles;
          modified = true;
        } else if (entry.responsible_roles) { 
           entry.author = Array.isArray(entry.responsible_roles) ? entry.responsible_roles.join(', ') : entry.responsible_roles;
           delete entry.responsible_roles;
           modified = true;
        }
      }

      // 2. Normalize Signature
      if (!entry.signature || entry.signature === '') {
        entry.signature = 'pending_sign';
        modified = true;
      }

      // 3. Timestamp Check
      if (!entry.timestamp) {
        if (entry.approved_date) {
            // Inference
            entry.timestamp = entry.approved_date.includes('T') ? entry.approved_date : `${entry.approved_date}T00:00:00Z`;
            modified = true;
        } else {
            errors.push({ level: 'error', msg: `${filename}:${lineNum} - Missing timestamp` });
        }
      }

      // Validation check for report
      if (!FIX) {
        if (!entry.author) errors.push({ level: 'error', msg: `${filename}:${lineNum} - Missing 'author' field` });
        if (!entry.signature) errors.push({ level: 'error', msg: `${filename}:${lineNum} - Missing 'signature' field` });
      }

      return { modified, finalEntry: entry, errors };
}

main();
