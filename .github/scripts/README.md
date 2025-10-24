# CI/CD Utility Scripts

This directory contains modular scripts for GitHub Actions workflow automation.

## Scripts Overview

### 1. `detect-env.js`

**Purpose:** Auto-detect project dependencies and configuration for dynamic CI workflows.

**Usage:**

```bash
# In GitHub Actions
node .github/scripts/detect-env.js

# Local testing (prints to console)
node .github/scripts/detect-env.js
```

**Outputs:**

| Variable              | Description                    | Example                                |
| --------------------- | ------------------------------ | -------------------------------------- |
| `package_manager`     | Detected package manager       | `npm`, `pnpm`, `yarn`                  |
| `test_framework`      | Primary test framework         | `jest`, `vitest`, `playwright`, `none` |
| `has_playwright`      | Playwright installed           | `true`, `false`                        |
| `has_axe_core`        | @axe-core/playwright installed | `true`, `false`                        |
| `has_jest`            | Jest installed                 | `true`, `false`                        |
| `has_vitest`          | Vitest installed               | `true`, `false`                        |
| `has_typescript`      | TypeScript configured          | `true`, `false`                        |
| `has_eslint`          | ESLint configured              | `true`, `false`                        |
| `node_versions`       | Node versions from engines     | `["18.x","20.x"]`                      |
| `vercel_node_version` | Vercel runtime version         | `20.x` or `unknown`                    |

**Example GitHub Actions Usage:**

```yaml
- name: Detect environment
  id: detect
  run: node .github/scripts/detect-env.js

- name: Install dependencies
  run: ${{ steps.detect.outputs.package_manager }} install

- name: Run tests
  if: steps.detect.outputs.has_jest == 'true'
  run: npm test
```

---

### 2. `merge-coverage.js`

**Purpose:** Merge Jest coverage reports from multiple Node.js versions.

**Usage:**

```bash
# After downloading artifacts from GitHub Actions
node .github/scripts/merge-coverage.js ./artifacts

# Custom artifact directory
node .github/scripts/merge-coverage.js /path/to/artifacts
```

**Input Structure:**

```
artifacts/
  coverage-report-node-18.x/
    coverage/
      coverage-final.json
      lcov.info
  coverage-report-node-20.x/
    coverage/
      coverage-final.json
      lcov.info
```

**Output:**

- `coverage-summary.json` (in current directory)
- Console output with global metrics

**Example Output:**

```
🔄 Starting coverage merge process...

✓ Found coverage file: artifacts/coverage-report-node-18.x/coverage/coverage-final.json
✓ Found coverage file: artifacts/coverage-report-node-20.x/coverage/coverage-final.json

📦 Found 2 coverage report(s)

✅ Merged coverage summary written to: coverage-summary.json

📊 Global Coverage Metrics (averaged across Node versions):
   Statements: 87.50%
   Functions:  89.20%
   Branches:   82.30%
   Lines:      88.10%

🔢 Node Versions Analyzed: 18.x, 20.x
```

---

## Local Development

### Testing Detection Script

```bash
# Clone repository
git clone https://github.com/your-org/quantumpoly.git
cd quantumpoly

# Run detection
node .github/scripts/detect-env.js
```

**Expected Output:**

```json
{
  "packageManager": "npm",
  "testFramework": "jest",
  "hasPlaywright": true,
  "hasAxeCore": true,
  "hasJest": true,
  "hasVitest": false,
  "hasTypeScript": true,
  "hasESLint": true,
  "nodeVersions": ["18.x", "20.x"],
  "vercelNodeVersion": "20.x"
}
```

### Testing Coverage Merge

```bash
# Run tests with coverage
npm run test:coverage

# Create mock artifact structure
mkdir -p artifacts/coverage-report-node-18.x/coverage
mkdir -p artifacts/coverage-report-node-20.x/coverage
cp -r coverage/* artifacts/coverage-report-node-18.x/coverage/
cp -r coverage/* artifacts/coverage-report-node-20.x/coverage/

# Run merge script
node .github/scripts/merge-coverage.js artifacts

# View output
cat coverage-summary.json | jq '.global'
```

---

## Extending the Scripts

### Adding New Detection

**Edit `detect-env.js`:**

```javascript
class EnvironmentDetector {
  // Add new detection method
  hasStorybook() {
    return this.hasPackage('@storybook/react');
  }

  // Include in detect() output
  detect() {
    const hasStorybook = this.hasStorybook();
    return {
      // ... existing detections
      hasStorybook,
    };
  }

  // Add to GitHub output
  outputToGitHubActions(results) {
    const lines = [
      // ... existing lines
      `has_storybook=${results.hasStorybook}`,
    ];
    // ...
  }
}
```

### Custom Coverage Merging Strategy

**Edit `merge-coverage.js`:**

```javascript
class CoverageMerger {
  // Change merging strategy from average to maximum
  mergeCoverageReports(coverageFiles) {
    // Replace this.average() with Math.max()
    const avgMetrics = {
      statements: Math.max(...versions.map((v) => v.statements.pct)),
      functions: Math.max(...versions.map((v) => v.functions.pct)),
      branches: Math.max(...versions.map((v) => v.branches.pct)),
      lines: Math.max(...versions.map((v) => v.lines.pct)),
    };
    // ...
  }
}
```

---

## Error Handling

### Common Issues

**Detection Script Fails:**

```
Error: Cannot read property 'dependencies' of null
```

**Solution:** Ensure `package.json` exists and is valid JSON.

```bash
npm install --package-lock-only
```

---

**Coverage Merge Fails:**

```
Error: No coverage files found to merge
```

**Solution:** Verify coverage reports exist in artifact directories:

```bash
ls -la artifacts/*/coverage/coverage-final.json
```

---

## Integration with CI/CD

These scripts are designed for GitHub Actions but can be adapted for:

- **GitLab CI:** Replace `$GITHUB_OUTPUT` with GitLab CI variables
- **Jenkins:** Output to environment files or properties
- **CircleCI:** Use environment variable commands
- **Local Pre-commit Hooks:** Run detection before commit to validate configuration

---

## Testing

### Unit Tests

```bash
# Install test dependencies
npm install --save-dev jest

# Run tests (when available)
npm test -- .github/scripts/*.test.js
```

### Integration Tests

See `.github/workflows/ci.yml` for real-world usage examples.

---

## Contributing

When modifying these scripts:

1. **Test locally** before committing
2. **Update documentation** in this README and `docs/CI_WORKFLOW_MAINTENANCE_GUIDE.md`
3. **Add error handling** for edge cases
4. **Follow existing code style** (Node.js 18+ features allowed)

---

## License

MIT License - See project root LICENSE file.

---

## Maintainers

- **QuantumPoly DevOps Team**
- **CASP Lead Architect**

For questions or issues, create a GitHub issue with the `ci/cd` label.
