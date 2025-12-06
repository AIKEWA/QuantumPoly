"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(ROOT_DIR, 'package.json');
const PACKAGE_LOCK = path.join(ROOT_DIR, 'package-lock.json');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'lockfile-sync.log');
// Ensure log directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const icon = type === 'SUCCESS' ? '✅' : type === 'WARN' ? '⚠️' : type === 'ERROR' ? '❌' : 'ℹ️';
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    const consoleEntry = `${icon} ${message}`;
    console.log(consoleEntry);
    fs.appendFileSync(LOG_FILE, logEntry + '\n');
}
function shouldSync() {
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
        (0, child_process_1.execSync)('npm install --legacy-peer-deps', { stdio: 'inherit', cwd: ROOT_DIR });
        log('Lockfile successfully regenerated.', 'SUCCESS');
        return true;
    }
    catch (error) {
        log(`Fatal mismatch or install failed: ${error}`, 'ERROR');
        process.exit(1);
    }
}
function commitChanges() {
    try {
        const status = (0, child_process_1.execSync)('git status --porcelain package-lock.json', { cwd: ROOT_DIR }).toString();
        if (status.trim()) {
            log('Committing regenerated package-lock.json...', 'INFO');
            (0, child_process_1.execSync)('git add package-lock.json', { stdio: 'inherit', cwd: ROOT_DIR });
            (0, child_process_1.execSync)('git commit -m "chore: auto-sync package-lock.json (Lockfile Integrity System)"', { stdio: 'inherit', cwd: ROOT_DIR });
            log('Changes committed.', 'SUCCESS');
        }
        else {
            log('No changes to commit.', 'INFO');
        }
    }
    catch (error) {
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
    }
    else {
        log('Lockfile up-to-date.', 'SUCCESS');
    }
}
main();
