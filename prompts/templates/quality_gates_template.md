# Quality Gates Workflow Template

**Purpose:** Generic template for implementing code quality gates (lint, typecheck, test) in CI/CD pipelines

**Customization Required:** Replace all `${VARIABLE}` placeholders with your project-specific values

---

## Template Workflow

```yaml
name: CI - Quality Gates

on:
  push:
    branches: [${MAIN_BRANCH}]  # e.g., main, master, develop
  pull_request:
    branches: [${MAIN_BRANCH}]

permissions:
  contents: read
  pull-requests: write  # For PR comments

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true  # Cancel superseded runs

jobs:
  quality:
    name: Code Quality (Lint · TypeCheck · Tests)
    runs-on: ubuntu-latest
    timeout-minutes: ${TIMEOUT_MINUTES}  # e.g., 10

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      # Node setup with caching for faster installs
      - name: Setup Node.js ${NODE_VERSION}
        uses: actions/setup-node@v4
        with:
          node-version: '${NODE_VERSION}'  # e.g., '20', '18'
          cache: '${PACKAGE_MANAGER}'      # e.g., 'npm', 'yarn', 'pnpm'

      - name: Install dependencies
        run: ${INSTALL_COMMAND}  # e.g., npm ci, yarn install --frozen-lockfile

      # GATE 1: Linting
      - name: Run linter
        run: ${LINT_COMMAND}  # e.g., npm run lint, yarn lint

      # GATE 2: Type checking
      - name: Run type checking
        run: ${TYPECHECK_COMMAND}  # e.g., npm run typecheck, tsc --noEmit

      # GATE 3: Unit tests with coverage
      - name: Run tests with coverage
        run: ${TEST_COMMAND}  # e.g., npm run test:coverage, yarn test --coverage
        env:
          NODE_ENV: test

      # Upload coverage for review
      - name: Upload coverage report
        if: always()  # Upload even if tests fail
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: ${COVERAGE_PATH}  # e.g., coverage/, .nyc_output/
          if-no-files-found: ignore
          retention-days: ${RETENTION_DAYS}  # e.g., 30

      # Optional: Upload test reports (JUnit XML)
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-report
          path: ${TEST_REPORT_PATH}  # e.g., reports/junit.xml
          if-no-files-found: ignore
          retention-days: ${RETENTION_DAYS}
```

---

## Customization Variables

| Variable               | Description                | Example Values                             |
| ---------------------- | -------------------------- | ------------------------------------------ |
| `${MAIN_BRANCH}`       | Main branch name           | `main`, `master`, `develop`                |
| `${TIMEOUT_MINUTES}`   | Job timeout                | `10`, `15`, `20`                           |
| `${NODE_VERSION}`      | Node.js version            | `'20'`, `'18'`, `'16'`                     |
| `${PACKAGE_MANAGER}`   | Package manager            | `'npm'`, `'yarn'`, `'pnpm'`                |
| `${INSTALL_COMMAND}`   | Dependency install command | `npm ci`, `yarn install --frozen-lockfile` |
| `${LINT_COMMAND}`      | Linting command            | `npm run lint`, `yarn lint`, `eslint .`    |
| `${TYPECHECK_COMMAND}` | Type checking command      | `npm run typecheck`, `tsc --noEmit`        |
| `${TEST_COMMAND}`      | Test command with coverage | `npm run test:coverage`, `jest --coverage` |
| `${COVERAGE_PATH}`     | Coverage output directory  | `coverage/`, `.nyc_output/`                |
| `${TEST_REPORT_PATH}`  | Test report path           | `reports/junit.xml`, `test-results/`       |
| `${RETENTION_DAYS}`    | Artifact retention period  | `7`, `14`, `30`, `90`                      |

---

## QuantumPoly Example

```yaml
# Real values used in QuantumPoly implementation
${MAIN_BRANCH}      = main
${TIMEOUT_MINUTES}  = 10
${NODE_VERSION}     = '20'
${PACKAGE_MANAGER}  = 'npm'
${INSTALL_COMMAND}  = npm ci
${LINT_COMMAND}     = npm run lint
${TYPECHECK_COMMAND}= npm run typecheck
${TEST_COMMAND}     = npm run test:coverage
${COVERAGE_PATH}    = coverage/
${TEST_REPORT_PATH} = reports/junit.xml
${RETENTION_DAYS}   = 30
```

---

## Optional Enhancements

### 1. Add Matrix Testing (Multiple Node Versions)

```yaml
quality:
  strategy:
    matrix:
      node-version: [18, 20]
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

### 2. Add PR Comments with Results

```yaml
- name: Comment PR with coverage
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const coverage = JSON.parse(fs.readFileSync('${COVERAGE_PATH}/coverage-summary.json'));

      const comment = `## 📊 Test Coverage
      - **Statements:** ${coverage.total.statements.pct}%
      - **Branches:** ${coverage.total.branches.pct}%
      - **Functions:** ${coverage.total.functions.pct}%
      - **Lines:** ${coverage.total.lines.pct}%`;

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

### 3. Add Code Quality Badges

```yaml
- name: Generate coverage badge
  if: github.ref == 'refs/heads/${MAIN_BRANCH}'
  run: ${BADGE_COMMAND} # e.g., npm run badge, coverage-badge
```

---

## Related Prompts

- **Block 7.1 (Architecture)** - Complete CI/CD pipeline design
- **Block 7.2 (Testing)** - Comprehensive testing strategy

---

**Template Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintained By:** CASP Lead Architect
