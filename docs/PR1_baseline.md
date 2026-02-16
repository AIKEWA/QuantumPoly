# PR-1 Baseline Snapshot

## Metadata

- Timestamp (Europe/Zurich): `2026-02-16 19:18:47 CET` (command output: `TZ=Europe/Zurich date '+%Y-%m-%d %H:%M:%S %Z'`)
- Branch name: `HEAD` (command output: `git rev-parse --abbrev-ref HEAD`)
- Commit SHA: `c9d8e02b3206c97f129cf96c0898cbd1435ee5b3` (command output: `git rev-parse HEAD`)
- Package manager + lockfile evidence: npm + `package-lock.json` (command output: `./package-lock.json` from `rg --files -g 'package-lock.json' -g 'npm-shrinkwrap.json' -g 'yarn.lock' -g 'pnpm-lock.yaml' -g 'bun.lockb' -g 'bun.lock' .`)
- Node local (node -v) + npm -v: `v22.15.1` / `10.9.2` (command output)
- Node in CI (file:line evidence): `.github/workflows/ci.yml:46` (`node-version: '20.x'`), `.github/workflows/ci.yml:80` (`node-version: ['20']`), `.github/workflows/frontend-ci.yml:18` (`node-version: '20.x'`), package engine `.github` independent constraint in `package.json:6` (`"node": ">=18 <21"`)

Evidence (STEP 0, verbatim command outputs):

```text
git rev-parse --abbrev-ref HEAD
HEAD

git status --porcelain


git log -1 --oneline
c9d8e02 chore(federation): daily verification results [automated]
```

Evidence (repo root listing + lockfile presence):

```text
ls -1
...
package-lock.json
...
```

Evidence (workflow trigger lines, verbatim command output from `for f in .github/workflows/*.yml; do ...`):

```text
### .github/workflows/a11y.yml
3:on:
4:  push:
6:  pull_request:
### .github/workflows/autonomous-monitoring.yml
3:on:
7:  workflow_dispatch:  # Enable manual trigger for Day 0 bootstrap
### .github/workflows/ci.yml
3:on:
4:  push:
6:  pull_request:
8:  workflow_dispatch:
### .github/workflows/daily-governance-report.yml
3:on:
7:  workflow_dispatch:  # Enable manual trigger for Day 0 bootstrap
### .github/workflows/e2e-tests.yml
3:on:
4:  pull_request:
6:  push:
8:  workflow_dispatch:
### .github/workflows/ethics-reporting.yml
3:on:
7:  workflow_dispatch: # Allow manual triggering
### .github/workflows/ewa-analysis.yml
3:on:
9:  workflow_dispatch:
### .github/workflows/ewa-postlaunch.yml
3:on:
7:  workflow_dispatch:  # Enable manual trigger for Day 0 bootstrap
### .github/workflows/federation-verification.yml
6:on:
11:  workflow_dispatch:
### .github/workflows/frontend-ci.yml
3:on:
4:  push:
6:  pull_request:
### .github/workflows/governance.yml
3:on:
7:  workflow_dispatch:  # Enable manual trigger for Day 0 bootstrap
### .github/workflows/i18n-validation.yml
3:on:
4:  pull_request:
10:  push:
### .github/workflows/integrity-verification.yml
3:on:
7:  workflow_dispatch:  # Enable manual trigger for Day 0 bootstrap
### .github/workflows/ledger-validation.yml
3:on:
4:  push:
8:  pull_request:
12:  workflow_dispatch:
### .github/workflows/link-check.yml
3:on:
4:  push:
11:  pull_request:
18:  workflow_dispatch:
### .github/workflows/perf.yml
3:on:
4:  push:
6:  pull_request:
### .github/workflows/policy-validation.yml
3:on:
4:  pull_request:
13:  workflow_dispatch:
### .github/workflows/preview.yml
3:on:
4:  pull_request:
### .github/workflows/release.yml
28:on:
29:  push:
### .github/workflows/seo-validation.yml
3:on:
4:  push:
6:  pull_request:
### .github/workflows/stage-vi-integrity.yml
3:on:
6:  workflow_dispatch:
### .github/workflows/vercel-deploy.yml
22:on:
23:  pull_request:
25:  push:
```

## Local Baseline Results

| Command                 | Exit code | PASS/FAIL | Notes                                                                                                                                |
| ----------------------- | --------: | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `rm -rf node_modules`   |       N/A | FAIL      | Command blocked by environment policy. Verbatim output: `Rejected("/bin/zsh -lc 'rm -rf node_modules' rejected: blocked by policy")` |
| `npm ci`                |         0 | PASS      | `EXIT_CODE=0` (captured from command output). Full log: `docs/baseline_logs/local_npm_ci.log`                                        |
| `npm test`              |         1 | FAIL      | `EXIT_CODE=1`. Full log: `docs/baseline_logs/local_npm_test.log`                                                                     |
| `npm run test:coverage` |         1 | FAIL      | `EXIT_CODE=1`. Full log: `docs/baseline_logs/local_test_coverage.log`                                                                |
| `npm run type-check`    |         0 | PASS      | `EXIT_CODE=0`. Full log: `docs/baseline_logs/local_type_check.log`                                                                   |

## CI Baseline Results

| Workflow                                      |        Run ID | Commit SHA                                 | Failing jobs                                 | Link/“not available”                                                                                                                                                         |
| --------------------------------------------- | ------------: | ------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Federation Verification (`main`, schedule)    | `22046093510` | `c9d8e02b3206c97f129cf96c0898cbd1435ee5b3` | `Verify Ledger Integrity` (failure)          | [run](https://github.com/AIKEWA/QuantumPoly/actions/runs/22046093510)                                                                                                        |
| Daily Governance Report (`main`, schedule)    | `22046062088` | `c9d8e02b3206c97f129cf96c0898cbd1435ee5b3` | `Generate Daily Governance Report` (failure) | [run](https://github.com/AIKEWA/QuantumPoly/actions/runs/22046062088)                                                                                                        |
| EWA v2 Autonomous Analysis (`main`, schedule) | `22045902887` | `c9d8e02b3206c97f129cf96c0898cbd1435ee5b3` | `Run EWA v2 Analysis` (failure)              | [run](https://github.com/AIKEWA/QuantumPoly/actions/runs/22045902887)                                                                                                        |
| Current branch/PR run IDs                     | not available | not available                              | not available                                | `gh pr status` => `Current branch: There is no current branch`; `gh run list --event pull_request --commit c9d8e02b3206c97f129cf96c0898cbd1435ee5b3 --limit 10` => no output |

## Failing Suites & Errors (verbatim)

- TEST FAILURES
  - Suite: `__tests__/a11y.footer.test.tsx` (`docs/baseline_logs/local_npm_test.log:451`, also `docs/baseline_logs/local_test_coverage.log:41`)

```text
TestingLibraryElementError: Unable to find an accessible element with the role "link" and name "GitHub"
```

- Suite: `__tests__/components/layouts/PolicyLayout.a11y.test.tsx` (`docs/baseline_logs/local_npm_test.log:1165`)

```text
TestingLibraryElementError: Found multiple elements with the role "status"
```

- Suite: `__tests__/a11y.home.test.tsx` and `__tests__/integration/heading-hierarchy.test.tsx` (`docs/baseline_logs/local_npm_test.log:53472`, `docs/baseline_logs/local_npm_test.log:53518`)

```text
Jest worker encountered 4 child process exceptions, exceeding retry limit
```

- ENVIRONMENT FAILURES
  - Suites: `__tests__/api/ethics/public.test.ts`, `__tests__/api/feedback-trust.test.ts` (`docs/baseline_logs/local_npm_test.log:1529`, `docs/baseline_logs/local_npm_test.log:1546`)

```text
ReferenceError: Request is not defined
```

- CI job: `Run EWA v2 Analysis` (`docs/baseline_logs/ci_run_22045902887_failed.log:237`)

```text
❌ Analysis failed: TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /home/runner/work/QuantumPoly/QuantumPoly/src/lib/ewa/engine/statistics.ts
```

- MODULE RESOLUTION FAILURES
  - Suites: `__tests__/components/faq.a11y.test.tsx`, `__tests__/components/faq.test.tsx` (`docs/baseline_logs/local_npm_test.log:1563`, `docs/baseline_logs/local_npm_test.log:1579`)

```text
Cannot find module '../../src/components/FAQ' from '__tests__/components/faq.a11y.test.tsx'
Cannot find module '../../src/components/FAQ' from '__tests__/components/faq.test.tsx'
```

- COVERAGE THRESHOLD FAILURES
  - `docs/baseline_logs/local_test_coverage.log:53751`

```text
Jest: "global" coverage threshold for statements (85%) not met: 12.14%
Jest: "global" coverage threshold for branches (85%) not met: 11.51%
Jest: "global" coverage threshold for lines (85%) not met: 11.94%
Jest: "global" coverage threshold for functions (85%) not met: 12.94%
```

- TYPECHECK FAILURES
  - None observed in local baseline (`docs/baseline_logs/local_type_check.log`)

```text
> quantumpoly@1.1.0 type-check
> tsc --noEmit
```

Local summaries (verbatim):

```text
Test Suites: 11 failed, 26 passed, 37 total
Tests:       7 failed, 22 todo, 596 passed, 625 total
Snapshots:   0 total
Time:        9.098 s
Ran all test suites.
```

```text
Test Suites: 11 failed, 26 passed, 37 total
Tests:       7 failed, 22 todo, 596 passed, 625 total
Snapshots:   0 total
Time:        10.423 s
Ran all test suites.
```

## Repo Scan: .js/.mjs References

- Search A1 (`rg -n "scripts/.*\.js\b" .`): 44 hits (`docs/baseline_logs/scan_A1_scripts_js.log`)
- Search A2 (`rg -n "\bnode\s+.*\.js\b" .`): 33 hits (`docs/baseline_logs/scan_A2_node_js.log`)
- Search A3 (`rg -n "\bnode\b.*scripts/.*" package.json .github/workflows`): 61 hits (`docs/baseline_logs/scan_A3_node_scripts.log`)
- Search B (`rg -n "\.js\b" package.json .github/workflows scripts next.config.* jest.config.* tsconfig*.json`): 102 hits (`docs/baseline_logs/scan_B_generic_js_refs.log`)
- Search C (`rg -n "(from\s+['\"].*\.js['\"]|require\(['\"].*\.js['\"]\))" .`): 4 hits, all in `storybook-static/*` generated bundles/maps (`docs/baseline_logs/scan_C_esm_cjs.log`)
- Scoped Search C on source/config paths: no hits (command returned no output): `rg -n "(from\s+['\"].*\.js['\"]|require\(['\"].*\.js['\"]\))" src scripts __tests__ package.json jest.config.js jest.a11y.config.js next.config.mjs .github/workflows`

Categorization:

- MUST-CHANGE (executed/imported runtime refs): `package.json:10`, `package.json:11`, `package.json:35`, `package.json:36`, `package.json:47`, `package.json:49`, `package.json:50` (runtime `node scripts/*.js` calls)
- OPTIONAL (docs/comments/examples only): e.g. `BLOCK06.2_SITEMAP_ROBOTS_IMPLEMENTATION.md:108`, `BLOCK06.2_SITEMAP_ROBOTS_IMPLEMENTATION.md:109`, `archive/FINAL_INTEGRATION_MEMO.md:16`
- RISKY (ESM/CJS boundary): `scripts/ewa-analyze.mjs:38`, `scripts/ewa-analyze.mjs:39`, `scripts/ewa-analyze.mjs:40` dynamic-import `.ts` files in Node runtime; CI failure evidence at `docs/baseline_logs/ci_run_22045902887_failed.log:237`

## Baseline vs Regression Verdict

Cannot determine (missing CI run IDs for current PR branch). Evidence: local baseline is red (`docs/baseline_logs/local_npm_test.log:54293` and `docs/baseline_logs/local_test_coverage.log:54522`), origin/main has failures too but in scheduled non-PR workflows (`gh run list --branch main --limit 10` output includes failures in `Federation Verification`, `Daily Governance Report`, `EWA v2 Autonomous Analysis`), and there is no current branch-bound PR run context (`gh pr status` shows `There is no current branch`; `gh run list --event pull_request --commit c9d8e02b3206c97f129cf96c0898cbd1435ee5b3 --limit 10` produced no output).

## Patch Plan v1 (≤5 files)

No patch proposed in this run.
Reason: regression status is unproven for PR-1 scope, and the observed ESM boundary risk is in a schedule/manual workflow path (`.github/workflows/ewa-analysis.yml:3-9`) not proven as a PR-1 blocker.
If (and only if) PR-1 scope requires this workflow green, smallest compat-only candidate would be:

- File: `scripts/ewa-analyze.mjs`
- Lines: `38-40`
- Before:

```js
const { performStatisticalAnalysis } = await import('../src/lib/ewa/engine/statistics.ts');
const { calculateSeverityScore, requiresHumanReview } =
  await import('../src/lib/ewa/engine/severity.ts');
const { calculateTrustTrajectory } = await import('../src/lib/ewa/trustTrajectory.ts');
```

- After (compat wrapper or precompiled JS target only; choose one):

```js
// Minimal compat option example (only if strictly required): import compiled .js outputs instead of .ts runtime imports
const { performStatisticalAnalysis } = await import('../dist/lib/ewa/engine/statistics.js');
const { calculateSeverityScore, requiresHumanReview } =
  await import('../dist/lib/ewa/engine/severity.js');
const { calculateTrustTrajectory } = await import('../dist/lib/ewa/trustTrajectory.js');
```

Execution context label: Executed in CI (workflow: `EWA v2 Autonomous Analysis`, job: `Run EWA v2 Analysis`), not evidenced as executed on pull_request.

## Evidence Pointers

- `docs/baseline_logs/local_npm_ci.log`
- `docs/baseline_logs/local_npm_test.log`
- `docs/baseline_logs/local_test_coverage.log`
- `docs/baseline_logs/local_type_check.log`
- `docs/baseline_logs/local_failure_excerpts.log`
- `docs/baseline_logs/ci_run_22046093510_failed.log`
- `docs/baseline_logs/ci_run_22046062088_failed.log`
- `docs/baseline_logs/ci_run_22045902887_failed.log`
- `docs/baseline_logs/scan_A1_scripts_js.log`
- `docs/baseline_logs/scan_A2_node_js.log`
- `docs/baseline_logs/scan_A3_node_scripts.log`
- `docs/baseline_logs/scan_B_generic_js_refs.log`
- `docs/baseline_logs/scan_C_esm_cjs.log`
