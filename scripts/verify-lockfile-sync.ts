import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');
const PACKAGE_LOCK = path.join(ROOT_DIR, 'package-lock.json');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'lockfile-sync.log');

// Ensure log directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function log(message: string, type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') {
  const timestamp = new Date().toISOString();
  const icon = type === 'SUCCESS' ? '✅' : type === 'WARN' ? '⚠️' : type === 'ERROR' ? '❌' : 'ℹ️';
  const logEntry = `[${timestamp}] [${type}] ${message}`;
  const consoleEntry = `${icon} ${message}`;

  console.log(consoleEntry);
  fs.appendFileSync(LOG_FILE, logEntry + '\n');
}

function shouldSync(): boolean {
  if (!fs.existsSync(PACKAGE_LOCK)) {
    log('package-lock.json is missing.', 'WARN');
    return true;
  }

  const pkgStats = fs.statSync(PACKAGE_JSON);
  const lockStats = fs.statSync(PACKAGE_LOCK);

  if (pkgStats.mtime > lockStats.mtime) {
    log('package.json is newer than package-lock.json.', 'WARN');
    return true;
  }

  return false;
}

function syncLockfile() {
  log('Resync triggered. Running npm install...', 'WARN');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit', cwd: ROOT_DIR });
    log('Lockfile successfully regenerated.', 'SUCCESS');
    return true;
  } catch (error) {
    log(`Fatal mismatch or install failed: ${error}`, 'ERROR');
    process.exit(1);
  }
}

function commitChanges() {
  try {
    const status = execSync('git status --porcelain package-lock.json', { cwd: ROOT_DIR }).toString();
    if (status.trim()) {
      log('Committing regenerated package-lock.json...', 'INFO');
      execSync('git add package-lock.json', { stdio: 'inherit', cwd: ROOT_DIR });
      execSync('git commit -m "chore: auto-sync package-lock.json (Lockfile Integrity System)"', { stdio: 'inherit', cwd: ROOT_DIR });
      log('Changes committed.', 'SUCCESS');
    } else {
      log('No changes to commit.', 'INFO');
    }
  } catch (error) {
    log(`Failed to commit changes: ${error}`, 'ERROR');
    // Don't exit here, as the sync itself was successful
  }
}

function main() {
  log('Starting lockfile integrity check...', 'INFO');

  const args = process.argv.slice(2);
  const autoCommit = args.includes('--commit');

  if (shouldSync()) {
    const success = syncLockfile();
    if (success && autoCommit) {
      commitChanges();
    }
  } else {
    log('Lockfile up-to-date.', 'SUCCESS');
  }
}

main();

