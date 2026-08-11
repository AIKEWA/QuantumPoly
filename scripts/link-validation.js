#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIRS = ['docs', 'content', 'prompts', 'sim'];
const MUST_PASS_DOMAINS = new Set(
  (process.env.LINK_CHECK_MUST_PASS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
);
const VALIDATE_ANCHORS = process.env.LINK_CHECK_VALIDATE_ANCHORS === 'true';

const SKIP_EXTERNAL_DOMAINS = new Set([
  'www.w3.org',
  'whatsmydns.net',
  'www.whatsmydns.net',
  'dnschecker.org',
  'securityheaders.com',
  'support.cloudflare.com',
  'standards.ieee.org',
]);

function isPlaceholderDomain(hostname) {
  return /^(canary|staging)\.quantumpoly\.ai$/i.test(hostname);
}

function isLocalhost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function walkMarkdownFiles(startDir, out) {
  const absolute = path.join(ROOT, startDir);
  if (!fs.existsSync(absolute)) return;
  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      walkMarkdownFiles(path.join(startDir, entry.name), out);
      continue;
    }
    if (entry.isFile() && fullPath.toLowerCase().endsWith('.md')) {
      out.push(fullPath);
    }
  }
}

function stripCodeFences(content) {
  const lines = content.split('\n');
  let inFence = false;
  const output = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    output.push(inFence ? '' : line);
  }
  return output.join('\n');
}

function extractLinks(content) {
  const stripped = stripCodeFences(content);
  const links = [];
  const inline = /(?<!!)\[[^\]]*]\(([^)]+)\)/g;
  const refDef = /^\s*\[[^\]]+]:\s*(\S+)/gm;

  let match;
  while ((match = inline.exec(stripped)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    const target = raw.startsWith('<') && raw.endsWith('>') ? raw.slice(1, -1).trim() : raw.split(/\s+/)[0];
    links.push(target);
  }

  while ((match = refDef.exec(stripped)) !== null) {
    links.push(match[1].trim());
  }

  return links;
}

function slugifyHeading(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-|-$/g, '');
}

const headingCache = new Map();
function loadHeadings(filePath) {
  if (headingCache.has(filePath)) return headingCache.get(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const stripped = stripCodeFences(content);
  const headings = new Set();
  for (const line of stripped.split('\n')) {
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const slug = slugifyHeading(match[2]);
    if (slug) headings.add(slug);
  }
  headingCache.set(filePath, headings);
  return headings;
}

async function fetchStatus(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'QuantumPoly-Link-Validation/1.0 (+https://www.quantumpoly.ai)',
      },
    });
    return response.status;
  } finally {
    clearTimeout(timeout);
  }
}

function splitTarget(target) {
  const hashIdx = target.indexOf('#');
  const queryIdx = target.indexOf('?');

  let pathPart = target;
  let fragment = '';

  if (queryIdx >= 0 && (hashIdx < 0 || queryIdx < hashIdx)) {
    pathPart = target.slice(0, queryIdx);
  }
  if (hashIdx >= 0) {
    pathPart = target.slice(0, hashIdx);
    fragment = target.slice(hashIdx + 1);
  }
  return { pathPart, fragment };
}

async function main() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    walkMarkdownFiles(dir, files);
  }

  const checkedLinks = new Set();
  const externalLinks = new Set();
  const internalChecks = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const links = extractLinks(content);

    for (const target of links) {
      if (!target) continue;
      if (target.startsWith('mailto:') || target.startsWith('tel:') || target.startsWith('javascript:')) continue;

      const key = `${filePath}::${target}`;
      if (checkedLinks.has(key)) continue;
      checkedLinks.add(key);

      if (target.startsWith('http://') || target.startsWith('https://')) {
        externalLinks.add(target);
        continue;
      }
      internalChecks.push({ filePath, target });
    }
  }

  let checked = 0;
  let skipped403 = 0;
  let warnings = 0;
  let failedInternal = 0;

  const internalFailures = [];

  for (const { filePath, target } of internalChecks) {
    checked += 1;

    if (target.startsWith('#')) {
      if (!VALIDATE_ANCHORS) continue;
      const anchor = target.slice(1);
      if (!anchor) continue;
      const headings = loadHeadings(filePath);
      if (!headings.has(anchor)) {
        failedInternal += 1;
        internalFailures.push(`${path.relative(ROOT, filePath)} -> ${target} (missing anchor)`);
      }
      continue;
    }

    if (target.startsWith('/')) {
      continue;
    }

    if (target.startsWith('//')) {
      externalLinks.add(`https:${target}`);
      continue;
    }

    const { pathPart, fragment } = splitTarget(target);
    const decodedPath = decodeURIComponent(pathPart);
    if (!decodedPath) continue;

    const absolute = path.resolve(path.dirname(filePath), decodedPath);
    const candidatePaths = [absolute];
    if (!path.extname(absolute)) {
      candidatePaths.push(`${absolute}.md`);
    }
    const resolved = candidatePaths.find((candidate) => fs.existsSync(candidate));
    if (!resolved) {
      failedInternal += 1;
      internalFailures.push(`${path.relative(ROOT, filePath)} -> ${target} (ENOENT)`);
      continue;
    }

    if (fragment && VALIDATE_ANCHORS) {
      if (!fs.statSync(resolved).isFile()) {
        failedInternal += 1;
        internalFailures.push(`${path.relative(ROOT, filePath)} -> ${target} (anchor on non-file target)`);
        continue;
      }
      const headings = loadHeadings(resolved);
      if (!headings.has(fragment)) {
        failedInternal += 1;
        internalFailures.push(`${path.relative(ROOT, filePath)} -> ${target} (missing anchor in target)`);
      }
    }
  }

  const externalList = Array.from(externalLinks);
  for (const target of externalList) {
    checked += 1;
    let url;
    try {
      url = new URL(target);
    } catch {
      warnings += 1;
      console.warn(`WARN external malformed URL: ${target}`);
      continue;
    }

    const hostname = url.hostname.toLowerCase();
    if (SKIP_EXTERNAL_DOMAINS.has(hostname) || isPlaceholderDomain(hostname) || isLocalhost(hostname)) {
      continue;
    }

    try {
      const status = await fetchStatus(target);
      if (status === 403) {
        skipped403 += 1;
        continue;
      }
      if (status >= 200 && status < 400) {
        continue;
      }

      const mustPass = MUST_PASS_DOMAINS.has(hostname);
      if (mustPass) {
        failedInternal += 1;
        internalFailures.push(`${target} (must-pass external returned ${status})`);
        continue;
      }

      if (status === 404 || status >= 500 || status >= 400) {
        warnings += 1;
        console.warn(`WARN external ${status}: ${target}`);
      }
    } catch (error) {
      const mustPass = MUST_PASS_DOMAINS.has(hostname);
      if (mustPass) {
        failedInternal += 1;
        internalFailures.push(`${target} (must-pass external request failed: ${error.message})`);
      } else {
        warnings += 1;
        console.warn(`WARN external request failed: ${target} (${error.message})`);
      }
    }
  }

  if (internalFailures.length > 0) {
    console.error('\nFailed internal/must-pass links:');
    for (const failure of internalFailures) {
      console.error(`  - ${failure}`);
    }
  }

  console.log(
    `\nSummary: {checked: ${checked}, skipped_403: ${skipped403}, warnings: ${warnings}, failed_internal: ${failedInternal}}`,
  );

  if (failedInternal > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
