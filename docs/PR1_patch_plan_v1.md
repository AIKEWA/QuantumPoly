# PR-1 Patch Plan v1 — `.js` → `.mjs` Invocation-Point Updates

## Metadata

| Key          | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Date         | 2026-02-16                                                    |
| Branch       | `pr-1-finalization`                                           |
| Baseline ref | `docs/PR1_baseline.md` (commit `74e7ff9`)                     |
| PR commit(s) | `8a8480a` (`ci: run github scripts as .mjs`)                  |
| Scope        | Invocation-point path/extension updates only (`.js` → `.mjs`) |
| Constraint   | ≤ 5 files edited (Plan A)                                     |

---

## 1. Category A Inventory — Broken Invocation Points

Category A: a `.mjs` file exists on disk, but an invocation point still references the old `.js` path.

### A-1: `detect-env.mjs` (CI — Environment Detection)

| Field               | Value                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `.mjs` file         | `.github/scripts/detect-env.mjs`                                                              |
| Invocation point    | `.github/workflows/ci.yml:50`                                                                 |
| Execution context   | **CI** — workflow `CI`, job `Environment Detection & Audit`, step `Run environment detection` |
| Status on `main`    | **BROKEN** — `MODULE_NOT_FOUND` (`detect-env.js` does not exist)                              |
| Status on PR branch | **FIXED** — commit `8a8480a` updates reference to `.mjs`                                      |

### A-2: `merge-coverage.mjs` (CI — Merge Coverage Reports)

| Field               | Value                                                                               |
| ------------------- | ----------------------------------------------------------------------------------- |
| `.mjs` file         | `.github/scripts/merge-coverage.mjs`                                                |
| Invocation point    | `.github/workflows/ci.yml:179`                                                      |
| Execution context   | **CI** — workflow `CI`, job `Merge Coverage Reports`, step `Merge coverage reports` |
| Status on `main`    | **BROKEN** — `MODULE_NOT_FOUND` (`merge-coverage.js` does not exist)                |
| Status on PR branch | **FIXED** — commit `8a8480a` updates reference to `.mjs`                            |

### Category A — Summary

| #   | Script               | Invocation file            | Line | Context | Fixed on PR? |
| --- | -------------------- | -------------------------- | ---- | ------- | ------------ |
| A-1 | `detect-env.mjs`     | `.github/workflows/ci.yml` | 50   | CI      | ✅ Yes       |
| A-2 | `merge-coverage.mjs` | `.github/workflows/ci.yml` | 179  | CI      | ✅ Yes       |

**Total Category A items: 2 — both already resolved by PR-1 commit `8a8480a`.**

No Category A items exist for:

- **Locally-executed scripts** (`package.json`) — all `.js` references point to existing `.js` files.
- **Vercel** — no `.js` script references in `vercel.json` or `vercel-build` script.

---

## 2. Unmigrated Scripts (`.js` only — NOT Category A)

These scripts still exist as `.js` files. Their `package.json` references are **correct** (pointing to existing files). They are NOT broken and are out of scope for this patch.

### Scripts with `.ts` source + compiled `.js` output (no `.mjs` exists)

| #   | Script                                | `package.json` line            | Has `.ts`? |
| --- | ------------------------------------- | ------------------------------ | ---------- |
| 1   | `scripts/verify-lockfile-sync.js`     | 10 (`presync`)                 | Yes        |
| 2   | `scripts/fix-missing-dependencies.js` | 11 (`prebuild`)                | Yes        |
| 3   | `scripts/generate-props-md.js`        | 47 (`docs:props`)              | Yes        |
| 4   | `scripts/validate-translations.js`    | 50 (`validate:translations`)   | Yes        |
| 5   | `scripts/validate-policy-reviews.js`  | 51 (`validate:policy-reviews`) | Yes        |
| 6   | `scripts/generate-locale-report.js`   | 52 (`validate:i18n:report`)    | Yes        |
| 7   | `scripts/generate-pseudo-locale.js`   | 53 (`generate:pseudo-locale`)  | Yes        |
| 8   | `scripts/add-locale.js`               | 54 (`add-locale`)              | Yes        |
| 9   | `scripts/simulate-governance.js`      | 105 (`simulate:governance`)    | Yes        |

### Scripts with `.js` only (no `.ts`, no `.mjs`)

| #   | Script                     | `package.json` line  |
| --- | -------------------------- | -------------------- |
| 10  | `scripts/check-sitemap.js` | 35 (`sitemap:check`) |
| 11  | `scripts/check-robots.js`  | 36 (`robots:check`)  |

### Dual-file anomaly

| Script                     | `.js`    | `.mjs`  | `.ts`    | Referenced as   | Note                                                                                                                                                                                    |
| -------------------------- | -------- | ------- | -------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/validate-locales` | 14 320 B | 2 445 B | 12 564 B | `.js` (line 49) | `.mjs` is a partial/incomplete ESM migration (6× smaller). `.js` is the comprehensive CJS version. Reference is **correct**. The stale `.mjs` should be deleted in a future cleanup PR. |

---

## 3. Baseline Cross-Check

### Failures directly caused by `.js` → `.mjs` mismatch

| Baseline section                                  | Failure                                                  | Root cause                                     | Fixed by PR-1?                 |
| ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- | ------------------------------ |
| CI-ONLY FAILURES §6 — CI workflow (`22074544047`) | `Cannot find module '.github/scripts/detect-env.js'`     | A-1: workflow references `.js`, file is `.mjs` | **Yes** — `ci.yml:50` updated  |
| CI-ONLY FAILURES §6 — CI workflow (`22074544047`) | `Cannot find module '.github/scripts/merge-coverage.js'` | A-2: workflow references `.js`, file is `.mjs` | **Yes** — `ci.yml:179` updated |

### Failures NOT caused by `.js` → `.mjs` mismatch (pre-existing baseline)

| Baseline section                 | Failure                                                    | Root cause                                                                          |
| -------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TEST FAILURES §1–5               | 7 test-case assertion failures across 5 suites             | Logic/date/DOM mismatches — not extension-related                                   |
| ENVIRONMENT FAILURES §6–7        | `ReferenceError: Request is not defined` (2 suites)        | Missing Web API polyfill in Jest env — not extension-related                        |
| MODULE RESOLUTION §8–9           | `Cannot find module '../../src/components/FAQ'` (2 suites) | Component does not exist at that path — missing/renamed component, not `.js`/`.mjs` |
| JEST WORKER CRASHES §10–11       | Worker child process exceptions (2 suites)                 | Memory/OOM in Jest workers — not extension-related                                  |
| CI — Vercel Deployment / Release | `Project not found`                                        | Vercel `PROJECT_ID` / `ORG_ID` config — not extension-related                       |
| CI — SEO Validation              | `Missing User-agent directive`                             | `robots.txt` content issue — not extension-related                                  |
| CI — Accessibility CI            | `React is not defined`                                     | Missing JSX runtime import in test files — not extension-related                    |
| CI — Link Validation             | Dead links (6 total)                                       | Broken URLs in docs — not extension-related                                         |
| CI — Stage VI Integrity          | Log not available                                          | Cannot determine root cause — not extension-related                                 |

---

## 4. Patch Plan v1 — Plan A (≤ 5 files)

### File 1: `.github/workflows/ci.yml` — **ALREADY APPLIED** (commit `8a8480a`)

**Evidence:**

- A-1: `.github/scripts/detect-env.mjs` exists; `ci.yml:50` on `main` references `.js`
- A-2: `.github/scripts/merge-coverage.mjs` exists; `ci.yml:179` on `main` references `.js`

**Change 1 — line 50:**

Before:

```yaml
- name: Run environment detection
  id: detect
  run: node .github/scripts/detect-env.js
```

After:

```yaml
- name: Run environment detection
  id: detect
  run: node .github/scripts/detect-env.mjs
```

Why: File was renamed to `.mjs` on `main`. CI job `Environment Detection & Audit` fails with `MODULE_NOT_FOUND`.

**Change 2 — line 179:**

Before:

```yaml
- name: Merge coverage reports
  run: node .github/scripts/merge-coverage.js ./artifacts
```

After:

```yaml
- name: Merge coverage reports
  run: node .github/scripts/merge-coverage.mjs ./artifacts
```

Why: File was renamed to `.mjs` on `main`. CI job `Merge Coverage Reports` fails with `MODULE_NOT_FOUND`.

**Expected impact:**

- Resolves: CI workflow `CI` run `22074544047` — jobs `Environment Detection & Audit` and `Merge Coverage Reports` (baseline §CI-ONLY FAILURES §6)
- No other files required.

### Additional files needed: **0**

All other `.js` references in `package.json` (12 scripts) and workflows (`preview.yml` → `.lighthouserc.js`) point to files that exist on disk as `.js`. No additional invocation-point mismatches were found.

**Plan A total: 1 file, 2 line changes. Within ≤ 5 file budget.**

### Plan B: Not required

No scenario was identified that would require > 5 file changes for invocation-point updates. All Category A items are addressed by the single `ci.yml` change.

---

## 5. Risk Notes — Category C Items

Category C: configuration files that remain `.js` due to CJS-native tooling. These are NOT broken, but represent an ESM/CJS boundary that must be handled carefully in any future migration.

| #   | File                  | Tool         | Why `.js` is required                                                                   | Risk if renamed to `.mjs`                            |
| --- | --------------------- | ------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| C-1 | `jest.config.js`      | Jest         | Jest uses `require()` to load config; expects CJS                                       | Tests break — Jest cannot `require()` an `.mjs` file |
| C-2 | `jest.a11y.config.js` | Jest         | Same as above; referenced by `npm run test:a11y`                                        | Tests break                                          |
| C-3 | `jest.setup.js`       | Jest         | Referenced by `jest.config.js:12` and `jest.a11y.config.js:26` via `setupFilesAfterEnv` | Tests break if setup file is `.mjs`                  |
| C-4 | `.lighthouserc.js`    | LHCI         | Referenced by `preview.yml:94` (`--config=.lighthouserc.js`); LHCI expects CJS config   | Lighthouse CI breaks                                 |
| C-5 | `tailwind.config.js`  | Tailwind CSS | PostCSS/Tailwind toolchain loads config via `require()`                                 | Build breaks                                         |

### Recommended compat approach (if any C item must be migrated in future):

1. **Option (a) — `dynamic import()` from CJS wrapper:**
   Keep a thin `.js` file that does `module.exports = import('./config.mjs').then(m => m.default);` — only works if the tool supports async config loading (Jest does not).

2. **Option (b) — `createRequire` in ESM:**
   Rename to `.mjs` and use `import { createRequire } from 'module'; const require = createRequire(import.meta.url);` for any CJS-only dependencies. Works for tools that support ESM config (Tailwind 4+, ESLint flat config).

3. **Option (c) — Tiny `.cjs` wrapper (recommended for Jest):**
   Rename logic to `jest.config.mjs`, create `jest.config.cjs` with: `module.exports = require('./jest.config.mjs');` — but this only works with dynamic import, not with Jest's sync config loader. Preferred alternative: keep `jest.config.js` as-is until Jest adds native ESM config support.

**Recommendation:** No Category C changes for PR-1. Keep all five files as `.js`. Revisit when tooling adds native ESM config support (Jest v30+, Tailwind v4+).

---

## 6. Verification Commands (CI-near)

Run these locally on the `pr-1-finalization` branch to confirm no regressions:

```bash
# 1. Clean install
rm -rf node_modules
npm ci

# 2. Unit tests (expect same baseline: 11 suites fail, 7 tests fail — pre-existing)
npm test

# 3. Coverage (expect same baseline as above — pre-existing failures)
npm run test:coverage

# 4. Type check (expect: exit 0, zero errors — matches baseline)
npm run typecheck

# 5. Verify .github/scripts/ are loadable as ESM
node --check .github/scripts/detect-env.mjs
node --check .github/scripts/merge-coverage.mjs
```

---

## 7. Expected Impact

### What should go green (improvement over baseline)

| Workflow / Job                       | Baseline status              | Expected after PR-1 merge |
| ------------------------------------ | ---------------------------- | ------------------------- |
| CI → `Environment Detection & Audit` | ❌ FAIL (`MODULE_NOT_FOUND`) | ✅ PASS                   |
| CI → `Merge Coverage Reports`        | ❌ FAIL (`MODULE_NOT_FOUND`) | ✅ PASS                   |

### What stays at baseline (pre-existing, unrelated to `.js` → `.mjs`)

| Workflow / Job                               | Baseline status   | Expected after PR-1 merge | Reason                                     |
| -------------------------------------------- | ----------------- | ------------------------- | ------------------------------------------ |
| Frontend CI → `build`                        | ❌ FAIL           | ❌ FAIL (same)            | 11 test suites fail (assertion/env errors) |
| Vercel Deployment → `Deploy to Staging`      | ❌ FAIL           | ❌ FAIL (same)            | `VERCEL_PROJECT_ID` not configured         |
| Release → `Deploy to Staging`                | ❌ FAIL           | ❌ FAIL (same)            | Same Vercel config issue                   |
| Accessibility CI → `Jest-Axe Unit Tests`     | ❌ FAIL           | ❌ FAIL (same)            | `React is not defined` in test env         |
| Accessibility CI → `Lighthouse A11y`         | ❌ FAIL           | ❌ FAIL (same)            | Depends on build success                   |
| SEO Validation → `Validate Sitemap & Robots` | ❌ FAIL           | ❌ FAIL (same)            | `robots.txt` missing `User-agent`          |
| Link Validation → `link-check`               | ❌ FAIL           | ❌ FAIL (same)            | Dead links in docs                         |
| Stage VI Integrity                           | ❌ FAIL           | Unknown                   | Log not available                          |
| Performance CI                               | ✅ PASS           | ✅ PASS (unchanged)       | —                                          |
| Local `npm test`                             | 11/37 suites fail | 11/37 suites fail (same)  | Pre-existing test failures                 |
| Local `tsc --noEmit`                         | ✅ PASS           | ✅ PASS (unchanged)       | —                                          |

### Net effect of PR-1

- **+2 CI jobs recovered** (Environment Detection, Merge Coverage)
- **0 regressions introduced**
- **0 test-suite changes** (local test failures are pre-existing)

---

## 8. Cleanup Recommendations (Out of Scope for PR-1)

These items are NOT required for merge-readiness but should be tracked:

| #   | Item                                                | Action                                                                  | Priority |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------- | -------- |
| 1   | `scripts/validate-locales.mjs` (2.4 KB)             | Delete — stale partial migration; `.js` (14.3 KB) is the active version | Low      |
| 2   | 9 scripts with `.ts` + compiled `.js` but no `.mjs` | Future PR: migrate to `.mjs` or compile to ESM                          | Low      |
| 3   | 2 scripts (`.js` only, no `.ts`)                    | Future PR: assess whether ESM migration is needed                       | Low      |
| 4   | Category C config files                             | Future PR: migrate when tooling supports ESM natively                   | Deferred |

---

_Generated by release engineer. Proposal only — no edits applied._
