# PR-1 Baseline Snapshot

## Metadata

| Key                    | Value                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Timestamp              | 2026-02-16 20:28:52 CET (Europe/Zurich)                                                               |
| Branch                 | `pr-1-finalization`                                                                                   |
| Commit SHA             | `74e7ff9` (`docs: add PR-1 baseline snapshot`)                                                        |
| Package manager        | **npm** (lockfile: `package-lock.json`)                                                               |
| Node (local)           | `v22.15.1`                                                                                            |
| npm (local)            | `10.9.2`                                                                                              |
| Node engine constraint | `>=18 <21` (`package.json:6`)                                                                         |
| `.nvmrc`               | `20`                                                                                                  |
| Node in CI             | `20` / `20.x` (all workflows via `actions/setup-node@v4`; exception: `frontend-ci.yml:16` uses `@v3`) |

> **WARNING:** Local Node v22.15.1 is **outside** the `package.json` engine constraint `>=18 <21`.
> CI runs Node 20.20.0. `npm ci` emits `EBADENGINE` warning locally.

---

## Local Baseline Results

| #   | Command                 | Exit Code | Status               | Notes                                                                                                 |
| --- | ----------------------- | --------- | -------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | `rm -rf node_modules`   | 0         | PASS                 | —                                                                                                     |
| 2   | `npm ci`                | 0         | PASS (with warnings) | EBADENGINE: local Node v22.15.1 outside `>=18 <21`; 51 vulnerabilities (11 low, 19 moderate, 21 high) |
| 3   | `npm test`              | 1         | **FAIL**             | 11 suites failed, 7 tests failed, 26 suites passed, 596 tests passed (625 total)                      |
| 4   | `npm run test:coverage` | 1         | **FAIL**             | Same 11 suites / 7 tests failed; coverage collected for passing suites                                |
| 5   | `npm run typecheck`     | 0         | PASS                 | `tsc --noEmit` — zero errors                                                                          |

---

## CI Baseline Results

### Runs on `main` (commit `74e7ff9`, pushed 2026-02-16T19:00:24Z)

| Workflow               | Run ID      | Status      | Failing Job(s)                                            | Link                                                                   |
| ---------------------- | ----------- | ----------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| **CI**                 | 22074544047 | failure     | `Environment Detection & Audit`, `Merge Coverage Reports` | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544047) |
| **Frontend CI**        | 22074544033 | failure     | `build` (npm test failed)                                 | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544033) |
| **Vercel Deployment**  | 22074544046 | failure     | `Deploy to Staging` (Project not found)                   | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544046) |
| **Release**            | 22074544056 | failure     | `Deploy to Staging` (Project not found)                   | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544056) |
| **Accessibility CI**   | 22074544040 | failure     | `Jest-Axe Unit Tests`, `Lighthouse A11y`                  | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544040) |
| **SEO Validation**     | 22074544053 | failure     | `Validate Sitemap & Robots` (robots.txt validation)       | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544053) |
| **Link Validation**    | 22074544044 | failure     | `link-check` (dead links in docs)                         | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544044) |
| **Stage VI Integrity** | 22074546672 | failure     | (log not available via `gh run view`)                     | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074546672) |
| **E2E Tests**          | 22074544081 | in_progress | —                                                         | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544081) |
| **Performance CI**     | 22074544048 | **success** | —                                                         | [View](https://github.com/AIKEWA/QuantumPoly/actions/runs/22074544048) |

### Runs on `pr-1-finalization`

No CI runs exist yet (no PR opened from this branch).

---

## Failing Suites & Errors (verbatim)

### TEST FAILURES

#### 1. `__tests__/lib/seo.test.ts`

```
● seo › isValidSEORoute › validates section routes

  expect(received).toBe(expected) // Object.is equality

  Expected: true
  Received: false
```

#### 2. `__tests__/components/layouts/PolicyLayout.test.tsx`

```
● PolicyLayout › should not show review overdue badge when date is in future

  expect(element).not.toBeInTheDocument()

  expected document not to contain element, found <span aria-live="polite"
  class="inline-flex items-center rounded-md border border-red-300 bg-red-50
  px-3 py-1 text-body-sm font-medium text-red-800" role="status">Review
  overdue — please review this page</span> instead
```

#### 3. `__tests__/a11y.footer.test.tsx`

```
● A11y: Footer › social links have proper labels

  TestingLibraryElementError: Unable to find an accessible element with the
  role "link" and name "GitHub"
```

#### 4. `__tests__/LanguageSwitcher.test.tsx`

```
● LanguageSwitcher Component › displays all supported locales as options

  expect(received).toHaveLength(expected)

  Expected length: 3
  Received length: 6
```

#### 5. `__tests__/components/layouts/PolicyLayout.a11y.test.tsx` (3 failures)

```
● PolicyLayout - Accessibility › Fallback Notice › should render fallback notice with proper ARIA attributes

  TestingLibraryElementError: Found multiple elements with the role "status"

● PolicyLayout - Accessibility › Fallback Notice › should not render fallback notice when isFallback is false

  expect(element).not.toBeInTheDocument()

  expected document not to contain element, found <span aria-live="polite"
  class="inline-flex items-center rounded-md border border-red-300 bg-red-50
  px-3 py-1 text-body-sm font-medium text-red-800" role="status">Review
  overdue — please review this page</span> instead

● PolicyLayout - Accessibility › Fallback Notice › should not render fallback notice by default

  expect(element).not.toBeInTheDocument()

  (same element found unexpectedly)
```

### ENVIRONMENT FAILURES

#### 6. `__tests__/api/ethics/public.test.ts`

```
● Test suite failed to run

  ReferenceError: Request is not defined

     6 | import { NextRequest } from 'next/server';
     7 |
  >  8 | import { GET, OPTIONS } from '@/app/api/ethics/public/route';
       |                 ^

  at Object.Request (node_modules/next/src/server/web/spec-extension/request.ts:15:34)
  at Object.<anonymous> (node_modules/next/server.js:2:16)
```

#### 7. `__tests__/api/feedback-trust.test.ts`

```
● Test suite failed to run

  ReferenceError: Request is not defined

     6 | import { NextRequest } from 'next/server';
     7 |
  >  8 | import { POST, GET } from '@/app/api/feedback/report/route';
       |                 ^

  at Object.Request (node_modules/next/src/server/web/spec-extension/request.ts:15:34)
  at Object.<anonymous> (node_modules/next/server.js:2:16)
```

### MODULE RESOLUTION FAILURES

#### 8. `__tests__/components/faq.test.tsx`

```
● Test suite failed to run

  Cannot find module '../../src/components/FAQ' from '__tests__/components/faq.test.tsx'

  at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
```

#### 9. `__tests__/components/faq.a11y.test.tsx`

```
● Test suite failed to run

  Cannot find module '../../src/components/FAQ' from '__tests__/components/faq.a11y.test.tsx'

  at Resolver._throwModNotFoundError (node_modules/jest-resolve/build/resolver.js:427:11)
```

### JEST WORKER CRASHES

#### 10. `__tests__/a11y.home.test.tsx`

```
● Test suite failed to run

  Jest worker encountered 4 child process exceptions, exceeding retry limit

  at ChildProcessWorker.initialize (node_modules/jest-worker/build/workers/ChildProcessWorker.js:181:21)
```

#### 11. `__tests__/integration/heading-hierarchy.test.tsx`

```
● Test suite failed to run

  Jest worker encountered 4 child process exceptions, exceeding retry limit

  at ChildProcessWorker.initialize (node_modules/jest-worker/build/workers/ChildProcessWorker.js:181:21)
```

### CI-ONLY FAILURES (from `gh run view --log-failed`)

#### CI workflow (22074544047) — Missing `.github/scripts/`

```
Error: Cannot find module '/home/runner/work/QuantumPoly/QuantumPoly/.github/scripts/detect-env.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
  code: 'MODULE_NOT_FOUND'

Error: Cannot find module '/home/runner/work/QuantumPoly/QuantumPoly/.github/scripts/merge-coverage.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
  code: 'MODULE_NOT_FOUND'
```

#### Vercel Deployment (22074544046) & Release (22074544056) — Project not found

```
Error! Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})
```

#### SEO Validation (22074544053) — robots.txt validation

```
❌ Validation failed with errors:
  1. Missing User-agent directive
```

#### Accessibility CI (22074544040) — `React is not defined` in a11y config

```
ReferenceError: React is not defined
  at __tests__/a11y.policy-layout.test.tsx:38:5
  at __tests__/a11y.footer.test.tsx:38:51
  at __tests__/a11y.home.test.tsx:25:53
```

#### Link Validation (22074544044) — Dead links

```
[✖] link → Status: 400 [Error: ENOENT: no such file or directory, access '/github/workspace/docs/link']
ERROR: 1 dead links found!

[✖] https://canary.quantumpoly.ai → Status: 0 Error: getaddrinfo ENOTFOUND canary.quantumpoly.ai
ERROR: 5 dead links found!

[✖] ./api/integrity/status → Status: 400 [Error: ENOENT]
ERROR: 1 dead links found!
```

### COVERAGE THRESHOLD FAILURES

None (no thresholds configured; `--passWithNoTests` used).

### TYPECHECK FAILURES

None (`tsc --noEmit` exit 0).

---

## Evidence Pointers

| Artifact          | Path                                         |
| ----------------- | -------------------------------------------- |
| npm ci log        | `docs/baseline_logs/local_npm_ci.log`        |
| npm test log      | `docs/baseline_logs/local_npm_test.log`      |
| test:coverage log | `docs/baseline_logs/local_test_coverage.log` |
| typecheck log     | `docs/baseline_logs/local_typecheck.log`     |

---

## Summary Counts

| Category                   | Count              |
| -------------------------- | ------------------ |
| Local test suites failed   | 11 / 37            |
| Local test cases failed    | 7 / 625            |
| Local test cases todo      | 22                 |
| CI workflows failed (main) | 8 / 10             |
| CI workflows passed (main) | 1 (Performance CI) |
| CI workflows in-progress   | 1 (E2E Tests)      |

---

_Generated by CI-aligned release engineer. No fixes proposed._
