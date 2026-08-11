import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'dependency-autoheal.log');
const IS_CI = process.env.CI === 'true' || process.env.CI === '1';

// Built-in Node.js modules to ignore
const BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http',
  'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'repl', 'stream',
  'string_decoder', 'sys', 'timers', 'tls', 'trace_events', 'tty', 'url',
  'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'
]);

function log(message: string) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  console.log(message);
  try {
    if (!fs.existsSync(path.dirname(LOG_FILE))) {
      fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, entry);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

function getInstalledDependencies(): Set<string> {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
  ]);
  return deps;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (/\.(ts|tsx|js|jsx)$/.test(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  
  // Static imports: import ... from '...'
  const staticImportRegex = /import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = staticImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Dynamic imports and require: import('...'), require('...')
  const dynamicImportRegex = /(?:import|require)\(['"]([^'"]+)['"]\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function normalizePackageName(importPath: string): string | null {
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return null; // Relative or absolute path
  }
  if (importPath.startsWith('@/')) {
    return null; // Alias
  }
  // Handle node: protocol
  if (importPath.startsWith('node:')) {
    return null;
  }

  // Handle built-ins with subpaths (e.g. fs/promises)
  const rootName = importPath.split('/')[0];
  if (BUILTINS.has(rootName)) {
    return null; 
  }

  // Handle scoped packages @scope/pkg
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  }

  // Handle regular packages pkg/subpath
  const parts = importPath.split('/');
  return parts[0];
}

async function main() {
  log('Starting dependency auto-healing check...');

  try {
    const installedDeps = getInstalledDependencies();
    const sourceFiles = getAllFiles(SRC_DIR);
    const usedPackages = new Set<string>();

    sourceFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      imports.forEach((imp) => {
        const pkg = normalizePackageName(imp);
        if (pkg) {
          usedPackages.add(pkg);
        }
      });
    });

    const missingPackages: string[] = [];

    usedPackages.forEach((pkg) => {
        // Check if it's in package.json
        const inPackageJson = installedDeps.has(pkg);
        
        // Check if it's physically in node_modules
        // Note: This is a basic check. Resolving correctly can be complex due to hoisting.
        // We'll rely primarily on package.json presence as the "source of truth" for definition,
        // but if it is in package.json, we expect it in node_modules. 
        // If it's NOT in package.json, it's definitely missing and needs install.
        
        let inNodeModules = false;
        try {
            require.resolve(pkg, { paths: [ROOT_DIR] });
            inNodeModules = true;
        } catch (e) {
            inNodeModules = false;
        }

        if (!inPackageJson) {
             missingPackages.push(pkg);
        } else if (!inNodeModules) {
             // It's defined but not installed? `npm install` usually fixes this.
             // But usually we just care about undeclared dependencies in source.
             // If we want to be strict, we could add it here too, but `npm ci` in build pipeline handles declared deps.
             // The requirement is "Detect missing npm modules" which implies undeclared ones.
             // However, "incomplete environment" might mean declared but missing.
             // Let's stick to undeclared for now to avoid re-installing things that might just be resolvable differently.
             // Actually, the prompt says "Check for unresolved imports... Compare against installed packages... Auto-install".
             // If it's missing from node_modules, we should probably install it.
             // But if it IS in package.json, `npm install` (no args) would fix it.
             // If it is NOT in package.json, `npm install <pkg>` fixes it.
             
             // Let's focus on packages NOT in package.json as that's the main breakage (missing dependency).
             // If it is in package.json but not node_modules, the CI/CD `npm ci` step handles that.
             // So we focus on UNLISTED dependencies.
        }
    });

    if (missingPackages.length > 0) {
      log(`Found ${missingPackages.length} missing dependencies: ${missingPackages.join(', ')}`);
      if (IS_CI) {
        log('CI mode detected. Dependency auto-install is disabled for deterministic builds.');
        log('Add missing dependencies to package.json locally and commit package-lock.json.');
        process.exit(1);
      }
      
      for (const pkg of missingPackages) {
        log(`Installing missing package: ${pkg}...`);
        try {
          execSync(`npm install ${pkg} --save`, { stdio: 'inherit', cwd: ROOT_DIR });
          log(`Successfully installed ${pkg}`);
        } catch (err) {
          log(`Failed to install ${pkg}: ${err}`);
          // Don't exit, try next one
        }
      }
      log('Auto-healing process completed.');
    } else {
      log('No missing dependencies found.');
    }

  } catch (error) {
    log(`Error during auto-healing: ${error}`);
    process.exit(1);
  }
}

main();
