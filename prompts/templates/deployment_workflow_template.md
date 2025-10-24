# Deployment Workflow Template

**Purpose:** Generic template for implementing deployment workflows (staging, production) with approval gates

**Customization Required:** Replace all `${VARIABLE}` placeholders with your project-specific values

---

## Template Workflow

```yaml
name: Deployment - Staging & Production

on:
  push:
    branches: [${MAIN_BRANCH}]   # Staging trigger
    tags: ['v*.*.*']              # Production trigger

permissions:
  contents: write      # For ledger/deployment commits
  deployments: write   # For GitHub deployments API

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false  # Never cancel deployments

jobs:
  # ========================================
  # STAGING DEPLOYMENT
  # ========================================
  deploy-staging:
    name: Deploy to Staging
    if: github.event_name == 'push' && github.ref == 'refs/heads/${MAIN_BRANCH}'
    runs-on: ubuntu-latest
    timeout-minutes: ${TIMEOUT_MINUTES}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '${NODE_VERSION}'
          cache: '${PACKAGE_MANAGER}'

      - name: Install dependencies
        run: ${INSTALL_COMMAND}

      # Platform-specific deployment commands
      - name: Deploy to ${DEPLOY_PLATFORM}
        id: deploy
        run: |
          ${STAGING_DEPLOY_COMMAND}
          echo "url=${STAGING_URL}" >> "$GITHUB_OUTPUT"
        env:
          ${DEPLOY_TOKEN_ENV}: ${{ secrets.${DEPLOY_TOKEN_SECRET} }}
          ${DEPLOY_CONFIG_ENV}: ${{ secrets.${DEPLOY_CONFIG_SECRET} }}

      - name: Upload deployment artifacts
        uses: actions/upload-artifact@v4
        with:
          name: staging-deployment
          path: ${DEPLOY_ARTIFACT_PATH}
          retention-days: 7  # Short retention for staging

  # ========================================
  # PRODUCTION DEPLOYMENT
  # ========================================
  validate-release:
    name: Validate Production Release
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      tag: ${{ steps.extract.outputs.tag }}

    steps:
      - uses: actions/checkout@v4

      - name: Verify tag format
        run: |
          TAG="${GITHUB_REF#refs/tags/}"
          if [[ ! "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "❌ Invalid tag format: $TAG"
            exit 1
          fi

      - name: Extract tag
        id: extract
        run: echo "tag=${GITHUB_REF#refs/tags/}" >> "$GITHUB_OUTPUT"

  deploy-production:
    name: Deploy to Production
    needs: [validate-release]
    runs-on: ubuntu-latest
    # Manual approval required via GitHub Environment
    environment:
      name: production
      url: ${PRODUCTION_URL}
    timeout-minutes: ${TIMEOUT_MINUTES}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '${NODE_VERSION}'
          cache: '${PACKAGE_MANAGER}'

      - name: Install dependencies
        run: ${INSTALL_COMMAND}

      # Platform-specific production deployment
      - name: Deploy to ${DEPLOY_PLATFORM} (Production)
        id: deploy
        run: |
          ${PRODUCTION_DEPLOY_COMMAND}
          echo "url=${PRODUCTION_URL}" >> "$GITHUB_OUTPUT"
        env:
          ${DEPLOY_TOKEN_ENV}: ${{ secrets.${DEPLOY_TOKEN_SECRET} }}
          ${DEPLOY_CONFIG_ENV}: ${{ secrets.${DEPLOY_CONFIG_SECRET} }}
          ${SITE_URL_ENV}: ${PRODUCTION_URL}

      - name: Upload deployment artifacts
        uses: actions/upload-artifact@v4
        with:
          name: production-deployment
          path: ${DEPLOY_ARTIFACT_PATH}
          retention-days: 90  # Long retention for compliance
```

---

## Customization Variables

### General

| Variable             | Description        | Example Values                             |
| -------------------- | ------------------ | ------------------------------------------ |
| `${MAIN_BRANCH}`     | Main branch name   | `main`, `master`, `develop`                |
| `${TIMEOUT_MINUTES}` | Deployment timeout | `15`, `20`, `30`                           |
| `${NODE_VERSION}`    | Node.js version    | `'20'`, `'18'`                             |
| `${PACKAGE_MANAGER}` | Package manager    | `'npm'`, `'yarn'`, `'pnpm'`                |
| `${INSTALL_COMMAND}` | Dependency install | `npm ci`, `yarn install --frozen-lockfile` |

### Deployment Platform

| Variable                       | Description               | Example Values                      |
| ------------------------------ | ------------------------- | ----------------------------------- |
| `${DEPLOY_PLATFORM}`           | Deployment platform       | `Vercel`, `Netlify`, `AWS`, `Azure` |
| `${STAGING_DEPLOY_COMMAND}`    | Staging deploy command    | See platform examples below         |
| `${PRODUCTION_DEPLOY_COMMAND}` | Production deploy command | See platform examples below         |
| `${DEPLOY_ARTIFACT_PATH}`      | Build output path         | `.vercel/output`, `dist/`, `.next/` |
| `${STAGING_URL}`               | Staging URL               | `https://staging.example.com`       |
| `${PRODUCTION_URL}`            | Production URL            | `https://www.example.com`           |

### Secrets

| Variable                  | Description         | Example Values                            |
| ------------------------- | ------------------- | ----------------------------------------- |
| `${DEPLOY_TOKEN_ENV}`     | Token env var name  | `VERCEL_TOKEN`, `NETLIFY_AUTH_TOKEN`      |
| `${DEPLOY_TOKEN_SECRET}`  | Token secret name   | `VERCEL_TOKEN`, `NETLIFY_AUTH_TOKEN`      |
| `${DEPLOY_CONFIG_ENV}`    | Config env var name | `VERCEL_PROJECT_ID`, `NETLIFY_SITE_ID`    |
| `${DEPLOY_CONFIG_SECRET}` | Config secret name  | `VERCEL_PROJECT_ID`, `NETLIFY_SITE_ID`    |
| `${SITE_URL_ENV}`         | Site URL env var    | `NEXT_PUBLIC_SITE_URL`, `GATSBY_SITE_URL` |

---

## Platform-Specific Examples

### Vercel (QuantumPoly)

```yaml
${DEPLOY_PLATFORM}            = Vercel
${STAGING_DEPLOY_COMMAND}     = |
npm i -g vercel@latest
vercel pull --yes --environment=preview --token=$VERCEL_TOKEN
vercel build --token=$VERCEL_TOKEN
vercel deploy --prebuilt --token=$VERCEL_TOKEN

${PRODUCTION_DEPLOY_COMMAND}  = |
npm i -g vercel@latest
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
vercel alias set $URL www.example.com --token=$VERCEL_TOKEN

${DEPLOY_ARTIFACT_PATH}       = .vercel/output
${DEPLOY_TOKEN_ENV}           = VERCEL_TOKEN
${DEPLOY_TOKEN_SECRET}        = VERCEL_TOKEN
${DEPLOY_CONFIG_ENV}          = VERCEL_PROJECT_ID
${DEPLOY_CONFIG_SECRET}       = VERCEL_PROJECT_ID
```

### Netlify

```yaml
${DEPLOY_PLATFORM}            = Netlify
${STAGING_DEPLOY_COMMAND}     = |
npm i -g netlify-cli
npm run build
netlify deploy --dir=dist --site=$NETLIFY_SITE_ID

${PRODUCTION_DEPLOY_COMMAND}  = |
npm i -g netlify-cli
npm run build
netlify deploy --dir=dist --site=$NETLIFY_SITE_ID --prod

${DEPLOY_ARTIFACT_PATH}       = dist/
${DEPLOY_TOKEN_ENV}           = NETLIFY_AUTH_TOKEN
${DEPLOY_TOKEN_SECRET}        = NETLIFY_AUTH_TOKEN
${DEPLOY_CONFIG_ENV}          = NETLIFY_SITE_ID
${DEPLOY_CONFIG_SECRET}       = NETLIFY_SITE_ID
```

### AWS S3 + CloudFront

```yaml
${DEPLOY_PLATFORM}            = AWS
${STAGING_DEPLOY_COMMAND}     = |
npm run build
aws s3 sync dist/ s3://$AWS_STAGING_BUCKET --delete
aws cloudfront create-invalidation --distribution-id $AWS_STAGING_CF_ID --paths "/*"

${PRODUCTION_DEPLOY_COMMAND}  = |
npm run build
aws s3 sync dist/ s3://$AWS_PRODUCTION_BUCKET --delete
aws cloudfront create-invalidation --distribution-id $AWS_PRODUCTION_CF_ID --paths "/*"

${DEPLOY_ARTIFACT_PATH}       = dist/
${DEPLOY_TOKEN_ENV}           = AWS_ACCESS_KEY_ID
${DEPLOY_TOKEN_SECRET}        = AWS_ACCESS_KEY_ID
${DEPLOY_CONFIG_ENV}          = AWS_SECRET_ACCESS_KEY
${DEPLOY_CONFIG_SECRET}       = AWS_SECRET_ACCESS_KEY
```

---

## Optional Enhancements

### 1. Add Deployment Notifications

```yaml
- name: Notify deployment status
  if: always()
  uses: actions/github-script@v7
  with:
    script: |
      const status = '${{ job.status }}' === 'success' ? '✅ Success' : '❌ Failed';
      const comment = `## ${status} - ${${ environment }} Deployment

      **Tag:** ${{ needs.validate-release.outputs.tag }}
      **URL:** ${{ steps.deploy.outputs.url }}
      **Status:** ${status}`;

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: comment
      });
```

### 2. Add Smoke Tests Post-Deployment

```yaml
- name: Run smoke tests
  run: |
    curl -f ${{ steps.deploy.outputs.url }} || exit 1
    ${SMOKE_TEST_COMMAND}  # e.g., npm run test:smoke
```

### 3. Add Rollback Mechanism

```yaml
- name: Rollback on failure
  if: failure()
  run: ${ROLLBACK_COMMAND} # Platform-specific rollback
```

---

## GitHub Environment Setup

**Required:** Create "production" environment in GitHub

**Steps:**

1. Repository → Settings → Environments
2. Click "New environment"
3. Name: `production`
4. Protection rules:
   - ✅ Required reviewers (add team members)
   - ✅ Deployment branches: Only tagged versions (`refs/tags/v*`)
5. Environment URL: `${PRODUCTION_URL}`

---

## Related Prompts

- **Block 7.1 (Architecture)** - Overall CI/CD design
- **Block 7.3 (Deployment)** - Complete deployment strategy

---

**Template Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintained By:** CASP Lead Architect
