# PR-1 Repo Scan: .js ↔ .mjs References

> **Generated:** 2026-02-16  
> **Branch:** `pr-1-finalization`  
> **HEAD:** `8a8480a ci: run github scripts as .mjs`  
> **`git status -sb`:** `## pr-1-finalization...origin/pr-1-finalization` (clean, 1 modified doc)

---

## 1) Search Commands Executed (verbatim)

```bash
# A) Broad ".js" hits in key config areas
rg -n --hidden --no-ignore-vcs "\.js\b" package.json .github/workflows/ scripts/ jest.a11y.config.js jest.config.js jest.setup.js next.config.mjs vercel.json 2>/dev/null

# B) Node execution patterns that may reference old filenames
rg -n --hidden --no-ignore-vcs "(node\s+.+\.js\b|bash\s+.+\.js\b|sh\s+.+\.js\b)" package.json .github/workflows/ scripts/ 2>/dev/null

# C) ESM/CJS boundary signals (execution risk)
rg -n --hidden --no-ignore-vcs "(require\(|module\.exports|exports\.|import\s+.+from|export\s+)" scripts/ jest.a11y.config.js jest.config.js jest.setup.js next.config.mjs 2>/dev/null

# D) Script path references anywhere
rg -n --hidden --no-ignore-vcs "(scripts/.*\.js\b|scripts/.*\.mjs\b|\.github/scripts/.*\.(js|mjs)\b)" . --glob '!node_modules' --glob '!.next' --glob '!package-lock.json' 2>/dev/null

# Supplementary: stale detect-env / merge-coverage refs
rg -n --no-ignore-vcs "detect-env\.(js|mjs)" . --glob '!node_modules' --glob '!.next' --glob '!package-lock.json' 2>/dev/null
rg -n --no-ignore-vcs "merge-coverage\.(js|mjs)" . --glob '!node_modules' --glob '!.next' --glob '!package-lock.json' 2>/dev/null

# Supplementary: .lighthouserc references
rg -n --no-ignore-vcs "\.lighthouserc" . --glob '!node_modules' --glob '!.next' --glob '!package-lock.json' 2>/dev/null

# Supplementary: jest config cross-references
rg -n --no-ignore-vcs "(jest\.config\.js|jest\.setup\.js|jest\.a11y\.config\.js)" . --glob '!node_modules' --glob '!.next' --glob '!package-lock.json' --glob '!jest.config.js' --glob '!jest.setup.js' --glob '!jest.a11y.config.js' 2>/dev/null
```

---

## 2) Findings Table: Hit → Category → Fix

### Legend

| Category | Meaning                                                            |
| -------- | ------------------------------------------------------------------ |
| **A**    | **Must-change** — directly executed/imported in runtime/CI         |
| **B**    | **Optional** — docs / comments / changelogs only                   |
| **C**    | **Risky** — ESM/CJS boundary, Jest runner, require/import mismatch |

---

### 2.1) package.json — npm script references to `scripts/*.js` (all Category A)

These npm scripts invoke `.js` files that are **CJS build artifacts** compiled from `.ts` via `build:scripts` (`tsc --module commonjs`). The `.js` files exist on disk and currently work. If PR-1 renames them to `.mjs`, every reference below must update.

| #   | File:Line          | Matched text                                                           | Cat   | Why                                               | Exec context                   | Fix                                   |
| --- | ------------------ | ---------------------------------------------------------------------- | ----- | ------------------------------------------------- | ------------------------------ | ------------------------------------- |
| 1   | `package.json:10`  | `"presync": "node scripts/verify-lockfile-sync.js"`                    | **A** | Runs on every `npm run build` via `prebuild` hook | Local (npm lifecycle)          | Change `.js` → `.mjs` in script value |
| 2   | `package.json:11`  | `"prebuild": "… node scripts/fix-missing-dependencies.js"`             | **A** | Runs on every `npm run build`                     | Local (npm lifecycle)          | Change `.js` → `.mjs` in script value |
| 3   | `package.json:35`  | `"sitemap:check": "node scripts/check-sitemap.js"`                     | **A** | SEO validation script                             | Local                          | Change `.js` → `.mjs`                 |
| 4   | `package.json:36`  | `"robots:check": "node scripts/check-robots.js"`                       | **A** | SEO validation script                             | Local                          | Change `.js` → `.mjs`                 |
| 5   | `package.json:47`  | `"docs:props": "node scripts/generate-props-md.js"`                    | **A** | Docs generation script                            | Local                          | Change `.js` → `.mjs`                 |
| 6   | `package.json:49`  | `"validate:locales": "node scripts/validate-locales.js"`               | **A** | Runs in `ci:validate` chain                       | Local + CI (via `ci:validate`) | Change `.js` → `.mjs`                 |
| 7   | `package.json:50`  | `"validate:translations": "node scripts/validate-translations.js"`     | **A** | Runs in `ci:validate` and `ci` chains             | Local + CI                     | Change `.js` → `.mjs`                 |
| 8   | `package.json:51`  | `"validate:policy-reviews": "node scripts/validate-policy-reviews.js"` | **A** | Runs in `ci:validate` chain                       | Local + CI (via `ci:validate`) | Change `.js` → `.mjs`                 |
| 9   | `package.json:52`  | `"validate:i18n:report": "node scripts/generate-locale-report.js"`     | **A** | i18n report generation                            | Local                          | Change `.js` → `.mjs`                 |
| 10  | `package.json:53`  | `"generate:pseudo-locale": "node scripts/generate-pseudo-locale.js"`   | **A** | Locale generation                                 | Local                          | Change `.js` → `.mjs`                 |
| 11  | `package.json:54`  | `"add-locale": "node scripts/add-locale.js"`                           | **A** | Locale management                                 | Local                          | Change `.js` → `.mjs`                 |
| 12  | `package.json:105` | `"simulate:governance": "node scripts/simulate-governance.js"`         | **A** | Governance simulation                             | Local                          | Change `.js` → `.mjs`                 |

**Before/after for item 1 (representative pattern for all 12):**

```
# BEFORE (package.json:10)
"presync": "node scripts/verify-lockfile-sync.js",

# AFTER
"presync": "node scripts/verify-lockfile-sync.mjs",
```

> **IMPORTANT DEPENDENCY:** Items 1–12 require the corresponding `scripts/*.js` files to actually be renamed to `.mjs` **and** rewritten/recompiled as ESM. See Section 2.5 (C-items) for the `build:scripts` risk.

---

### 2.2) Jest config references (Category A / C)

| #   | File:Line                | Matched text                                         | Cat   | Why                                                                                              | Exec context | Fix                                             |
| --- | ------------------------ | ---------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------- |
| 13  | `package.json:25`        | `"test:a11y": "jest --config jest.a11y.config.js …"` | **A** | Directly invoked by `npm run test:a11y`                                                          | Local + CI   | Change `.js` → `.mjs` (only if file is renamed) |
| 14  | `jest.config.js:12`      | `setupFilesAfterEnv: ['<rootDir>/jest.setup.js']`    | **C** | Jest resolves this path at runtime; renaming jest.setup.js to .mjs risks Jest ESM interop issues | Local + CI   | See C-item analysis below                       |
| 15  | `jest.a11y.config.js:26` | `setupFilesAfterEnv: ['<rootDir>/jest.setup.js']`    | **C** | Same risk as #14                                                                                 | Local + CI   | See C-item analysis below                       |

---

### 2.3) Lighthouse CI config reference (Category A)

| #   | File:Line                          | Matched text                | Cat   | Why                                                 | Exec context         | Fix                                                                        |
| --- | ---------------------------------- | --------------------------- | ----- | --------------------------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| 16  | `.github/workflows/preview.yml:94` | `--config=.lighthouserc.js` | **A** | CI workflow directly passes config filename to LHCI | CI: `preview.yml:94` | Change to `.lighthouserc.mjs` only if the file is renamed (see C-item #25) |

**Before/after:**

```yaml
# BEFORE (preview.yml:94)
run: npx lhci autorun --config=.lighthouserc.js --collect.settings.onlyCategories=accessibility …

# AFTER
run: npx lhci autorun --config=.lighthouserc.mjs --collect.settings.onlyCategories=accessibility …
```

---

### 2.4) Doc/comment references to already-renamed `.github/scripts/` files (Category B)

The files `.github/scripts/detect-env.js` and `.github/scripts/merge-coverage.js` were **already renamed** to `.mjs` (commit `8a8480a`). These doc references are **stale** — they point to filenames that no longer exist.

| #   | File:Line(s)                                    | Matched text (summary)                                     | Cat   | Why                                     | Exec context | Fix                            |
| --- | ----------------------------------------------- | ---------------------------------------------------------- | ----- | --------------------------------------- | ------------ | ------------------------------ |
| 17  | `.github/scripts/README.md:7`                   | `### 1. \`detect-env.js\``                                 | **B** | Section heading references old filename | Docs         | Change to `detect-env.mjs`     |
| 18  | `.github/scripts/README.md:14,18`               | `node .github/scripts/detect-env.js`                       | **B** | Runnable example uses old filename      | Docs         | Change to `detect-env.mjs`     |
| 19  | `.github/scripts/README.md:41`                  | `run: node .github/scripts/detect-env.js`                  | **B** | YAML example uses old filename          | Docs         | Change to `detect-env.mjs`     |
| 20  | `.github/scripts/README.md:53`                  | `### 2. \`merge-coverage.js\``                             | **B** | Section heading references old filename | Docs         | Change to `merge-coverage.mjs` |
| 21  | `.github/scripts/README.md:61,63`               | `node .github/scripts/merge-coverage.js`                   | **B** | Runnable examples use old filename      | Docs         | Change to `merge-coverage.mjs` |
| 22  | `.github/scripts/README.md:119,152`             | `node .github/scripts/detect-env.js` / `merge-coverage.js` | **B** | Local dev section                       | Docs         | Change both to `.mjs`          |
| 23  | `.github/scripts/README.md:164,195`             | `Edit \`detect-env.js\`:`/`Edit \`merge-coverage.js\`:`    | **B** | Extension guide headings                | Docs         | Change to `.mjs`               |
| 24  | `docs/CI_ENHANCEMENTS_SUMMARY.md:23,46,276,301` | Multiple refs to `.github/scripts/detect-env.js`           | **B** | Enhancement summary doc                 | Docs         | Optional: doc-only             |
| 25  | `docs/CI_ENHANCEMENTS_SUMMARY.md:89,282,302`    | Multiple refs to `.github/scripts/merge-coverage.js`       | **B** | Enhancement summary doc                 | Docs         | Optional: doc-only             |
| 26  | `docs/CI_WORKFLOW_MAINTENANCE_GUIDE.md:39,112`  | `detect-env.js` in table and prose                         | **B** | Maintenance guide                       | Docs         | Optional: doc-only             |
| 27  | `docs/CI_WORKFLOW_MAINTENANCE_GUIDE.md:40,253`  | `merge-coverage.js` in table and prose                     | **B** | Maintenance guide                       | Docs         | Optional: doc-only             |
| 28  | `docs/README.CI-CD.md:360`                      | `.github/scripts/merge-coverage.js`                        | **B** | CI-CD readme                            | Docs         | Optional: doc-only             |
| 29  | `docs/audits/BLOCK7_FINALIZATION_AUDIT.md:175`  | `node .github/scripts/detect-env.js`                       | **B** | Historical audit doc                    | Docs         | Optional: doc-only             |
| 30  | `docs/audits/BLOCK7_FINALIZATION_AUDIT.md:347`  | `node .github/scripts/merge-coverage.js ./artifacts`       | **B** | Historical audit doc                    | Docs         | Optional: doc-only             |

---

### 2.5) Doc/comment references to jest config files (Category B)

References to `jest.config.js`, `jest.setup.js`, and `jest.a11y.config.js` in documentation and comments. These are informational only.

| #   | File:Line(s)                                                             | Matched text (summary)                                        | Cat   | Why                                                    | Fix                  |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ----- | ------------------------------------------------------ | -------------------- |
| 31  | `jest.setup.js:2`                                                        | `remove \`setupFilesAfterEnv\` from \`jest.config.js\``       | **B** | Comment                                                | Optional: doc-only   |
| 32  | `jest.setup.js:4`                                                        | `Used for __tests__/testing-library.js`                       | **B** | Comment                                                | Optional: doc-only   |
| 33  | `jest.config.js:6`                                                       | `load next.config.js and .env files`                          | **B** | Comment (next/jest loads `next.config.mjs` regardless) | Optional: doc-only   |
| 34  | `jest.config.js:46`                                                      | `Handle module aliases (if you use them in your Next.js app)` | **B** | Comment — "Next.js" is a proper noun, not a file       | N/A (false positive) |
| 35  | `jest.config.js:54`                                                      | `next/jest can load the Next.js config which is async`        | **B** | Comment                                                | Optional: doc-only   |
| 36  | `jest.a11y.config.js:9-10`                                               | `jest --config jest.a11y.config.js`                           | **B** | Usage comment                                          | Optional: doc-only   |
| 37  | `scripts/verify-cicd-remediation.sh:76-113`                              | Multiple `jest.config.js` refs in grep checks                 | **B** | Verification script checks jest config exists          | Optional: doc-only   |
| 38  | `CICD_REMEDIATION_IMPLEMENTATION_SUMMARY.md:60,76-77,88,274,293,311,323` | Multiple `jest.config.js` refs                                | **B** | Implementation summary                                 | Optional: doc-only   |

---

### 2.6) Shell script references to .js config files (Category B)

| #   | File:Line                                 | Matched text                                                     | Cat   | Why                                   | Fix                                               |
| --- | ----------------------------------------- | ---------------------------------------------------------------- | ----- | ------------------------------------- | ------------------------------------------------- |
| 39  | `scripts/setup-preview-deployment.sh:85`  | `[ ! -f ".storybook/main.ts" ] && [ ! -f ".storybook/main.js" ]` | **B** | Checks if storybook config exists     | Optional: doc-only                                |
| 40  | `scripts/setup-preview-deployment.sh:100` | `if [ -f ".lighthouserc.js" ]; then`                             | **B** | Existence check for lighthouse config | Optional: update if `.lighthouserc.js` is renamed |

---

### 2.7) ESM/CJS Boundary Risks (Category C)

These are files where renaming `.js` → `.mjs` introduces **breaking risk** due to module system boundaries.

| #   | File                                          | Issue                                                                                                       | Cat   | Risk description                                                                                                                                                                                                                                       | Smallest compat approach                                                                                                                                                                                                          |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 41  | `jest.config.js` (entire file)                | Uses `require('next/jest')` (line 3) and `module.exports` (line 55) — pure CJS                              | **C** | Renaming to `.mjs` makes Node treat it as ESM; `require()` is not available in ESM without `createRequire`. Jest config resolution may also fail.                                                                                                      | Keep as `.js`. Jest's config loader expects CJS by default. If ESM needed, use `jest.config.mjs` with `import { createRequire } from 'module'` and dynamic `next/jest` import.                                                    |
| 42  | `jest.setup.js` (entire file)                 | Uses ESM `import` syntax (lines 6, 9, 13, 14) **but** runs under Jest's transform pipeline, not native Node | **C** | Renaming to `.mjs` changes Node's module interpretation. Jest may fail to load the setup file if it expects CJS resolution. The ESM imports currently work because Jest/SWC transforms them.                                                           | Keep as `.js`. Jest handles the transform. If renaming, verify with `npx jest --showConfig` that setupFilesAfterEnv resolves correctly.                                                                                           |
| 43  | `jest.a11y.config.js` (entire file)           | Uses `module.exports` (line 13) — pure CJS                                                                  | **C** | Same as #41; renaming breaks `module.exports`                                                                                                                                                                                                          | Keep as `.js`.                                                                                                                                                                                                                    |
| 44  | `.lighthouserc.js` (entire file)              | Uses `module.exports` (line 1) — pure CJS                                                                   | **C** | LHCI CLI loads config via `require()`. Renaming to `.mjs` would require LHCI to support ESM config loading (unverified).                                                                                                                               | Keep as `.js`, or verify LHCI ESM support first. If supported, rewrite as `export default { … }` and rename to `.mjs`.                                                                                                            |
| 45  | `package.json:108`                            | `"build:scripts": "tsc scripts/*.ts --target ES2020 --outDir scripts/ --module commonjs …"`                 | **C** | The `--module commonjs` flag causes tsc to emit CJS `.js` files. Changing to `--module es2020` or `esnext` emits ESM but tsc still outputs `.js` (not `.mjs`). Renaming outputs requires post-build step or tsconfig `"moduleResolution": "nodenext"`. | If transitioning scripts/_.js to ESM: (1) change `--module` to `es2020`, (2) add a post-build rename step `for f in scripts/_.js; do mv "$f" "${f%.js}.mjs"; done`, (3) update all package.json refs. **High coordination cost.** |
| 46  | `scripts/check-sitemap.js` (standalone)       | Uses `require('http')`, `require('https')`, `require('url')` — native CJS, no .ts source                    | **C** | Not a compiled artifact. Must be manually rewritten to ESM if renamed to `.mjs`.                                                                                                                                                                       | Keep as `.js`, or rewrite all `require()` → `import` and `module.exports` → `export`.                                                                                                                                             |
| 47  | `scripts/check-robots.js` (standalone)        | Uses `require('http')`, `require('https')`, `require('url')` — native CJS, no .ts source                    | **C** | Same as #46                                                                                                                                                                                                                                            | Same as #46                                                                                                                                                                                                                       |
| 48  | `scripts/project-validation.js` (standalone)  | Uses `require('fs')`, `require('path')`, `require('child_process')`, `module.exports` — native CJS          | **C** | Same as #46. Also referenced in its own docblock as `node scripts/project-validation.js` (line 7).                                                                                                                                                     | Same as #46                                                                                                                                                                                                                       |
| 49  | `scripts/benchmark-stability.js` (standalone) | CJS file, no .ts source                                                                                     | **C** | Needs manual ESM rewrite if renamed                                                                                                                                                                                                                    | Same as #46                                                                                                                                                                                                                       |

---

## 3) Summary

### Counts

| Category            | Count  | Description                                                                                            |
| ------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| **A** (Must-change) | **16** | Directly executed references in package.json scripts, CI workflows, and Jest config paths              |
| **B** (Optional)    | **24** | Doc/comment/changelog references (including 14 stale refs to already-renamed `.github/scripts/` files) |
| **C** (Risky)       | **9**  | ESM/CJS boundary files (Jest configs, LHCI config, `build:scripts`, standalone CJS scripts)            |
| **Total**           | **49** |                                                                                                        |

### A-items ranked by execution impact

#### 1) CI blockers (highest priority)

| Rank | Item # | File:Line         | Impact                                                                                    |
| ---- | ------ | ----------------- | ----------------------------------------------------------------------------------------- |
| 1    | #16    | `preview.yml:94`  | LHCI config path in CI — breaks Lighthouse CI job if `.lighthouserc.js` is renamed        |
| 2    | #7     | `package.json:50` | `validate:translations` — used in `ci:validate` → `ci` npm script chain, which maps to CI |
| 3    | #6     | `package.json:49` | `validate:locales` — used in `ci:validate` chain                                          |
| 4    | #8     | `package.json:51` | `validate:policy-reviews` — used in `ci:validate` chain                                   |

#### 2) Local scripts (build-critical)

| Rank | Item # | File:Line         | Impact                                                      |
| ---- | ------ | ----------------- | ----------------------------------------------------------- |
| 5    | #1     | `package.json:10` | `presync` — runs on every `npm run build` (lifecycle hook)  |
| 6    | #2     | `package.json:11` | `prebuild` — runs on every `npm run build` (lifecycle hook) |
| 7    | #13    | `package.json:25` | `test:a11y` — Jest a11y config path                         |

#### 3) Local scripts (utility / validation)

| Rank  | Item #   | File:Line                                     | Impact                                       |
| ----- | -------- | --------------------------------------------- | -------------------------------------------- |
| 8     | #3       | `package.json:35`                             | `sitemap:check`                              |
| 9     | #4       | `package.json:36`                             | `robots:check`                               |
| 10    | #5       | `package.json:47`                             | `docs:props`                                 |
| 11    | #9       | `package.json:52`                             | `validate:i18n:report`                       |
| 12    | #10      | `package.json:53`                             | `generate:pseudo-locale`                     |
| 13    | #11      | `package.json:54`                             | `add-locale`                                 |
| 14    | #12      | `package.json:105`                            | `simulate:governance`                        |
| 15-16 | #14, #15 | `jest.config.js:12`, `jest.a11y.config.js:26` | `setupFilesAfterEnv` path to `jest.setup.js` |

### ≤ 5 file edits candidate set (minimum for PR-1)

The **smallest set of edits** to complete the `.js → .mjs` transition depends on scope:

#### Scope A — Minimal (`.github/scripts/` only, already done)

CI is already passing with `.mjs` references in `ci.yml`. The only remaining work:

| #   | File                        | Edit                                                                                                         |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | `.github/scripts/README.md` | Update all `detect-env.js` → `detect-env.mjs` and `merge-coverage.js` → `merge-coverage.mjs` (14 stale refs) |

**1 file edit.** All other `.js` references are to files that still exist as `.js` and work.

#### Scope B — Full transition (all `scripts/*.js` + configs)

If PR-1 intends to rename **all** `.js` scripts to `.mjs`:

| #   | File                            | Edit                                                                     |
| --- | ------------------------------- | ------------------------------------------------------------------------ |
| 1   | `package.json`                  | Update 12 npm script references (items #1–#12) + `build:scripts` command |
| 2   | `.github/scripts/README.md`     | Update 14 stale references                                               |
| 3   | `.github/workflows/preview.yml` | Update `.lighthouserc.js` → `.lighthouserc.mjs` (line 94)                |
| 4   | `jest.config.js`                | Update `setupFilesAfterEnv` path if `jest.setup.js` is renamed           |
| 5   | `jest.a11y.config.js`           | Update `setupFilesAfterEnv` path if `jest.setup.js` is renamed           |

**5 file edits** — but this scope carries significant C-risk (items #41–#49). The Jest configs and `.lighthouserc.js` use CJS `require()`/`module.exports` and cannot simply be renamed without rewriting. The `build:scripts` pipeline (item #45) needs a new module target and post-build rename step.

#### Recommendation

For **PR-1 closure**, Scope A (1 file edit) is sufficient. The `scripts/*.js` and config files use CJS intentionally and work correctly. A full ESM transition of those files should be a **separate PR** with proper Jest/LHCI compatibility testing.

---

_END OF SCAN. No code changes applied. No patches proposed beyond the "Fix" column descriptions._
