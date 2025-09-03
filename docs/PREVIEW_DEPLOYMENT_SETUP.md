# Preview Deployment Setup Guide

## Overview

This guide provides step-by-step instructions for setting up automated preview deployments with Lighthouse CI and Storybook accessibility testing for the QuantumPoly project.

## Prerequisites

- GitHub repository with admin access
- Vercel account with deployment permissions
- Node.js 20+ installed locally
- Basic understanding of CI/CD concepts

## Vercel Setup

### 1. Create Vercel Project
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project" and import your GitHub repository
3. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

### 2. Obtain Vercel Credentials
```bash
# Install Vercel CLI globally
npm install -g vercel@latest

# Login to Vercel
vercel login

# Navigate to your project directory
cd /path/to/quantumpoly

# Link project and get IDs
vercel link

# Get organization and project IDs
vercel project ls
```

### 3. Generate Access Token
1. Go to [Vercel Dashboard > Settings > Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name: `GitHub Actions - QuantumPoly`
4. Expiration: Set appropriate expiration (recommend 1 year)
5. Scope: Select your account/organization
6. Copy the generated token (save securely - shown only once)

## GitHub Repository Configuration

### 1. Add Repository Secrets
Navigate to `Settings > Secrets and variables > Actions` in your GitHub repository:

```
Secret Name: VERCEL_TOKEN
Secret Value: [Your Vercel access token from step 3]

Secret Name: VERCEL_ORG_ID  
Secret Value: [Your organization ID from vercel link]

Secret Name: VERCEL_PROJECT_ID
Secret Value: [Your project ID from vercel link]
```

### 2. Verify Secret Configuration
Create a test workflow to verify secrets are properly configured:

```yaml
# .github/workflows/verify-secrets.yml (temporary)
name: Verify Secrets
on: workflow_dispatch

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Check secrets
        run: |
          echo "VERCEL_TOKEN length: ${#VERCEL_TOKEN}"
          echo "VERCEL_ORG_ID: $VERCEL_ORG_ID"
          echo "VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Local Development Setup

### 1. Install New Dependencies
```bash
# Install accessibility and lighthouse dependencies
npm install -D @storybook/addon-a11y @storybook/test @lhci/cli

# Update existing dependencies if needed
npm update @storybook/addon-essentials @storybook/nextjs
```

### 2. Verify Storybook Configuration
```bash
# Start Storybook and verify a11y addon is working
npm run storybook

# Build Storybook to test build process
npm run build-storybook

# Run Storybook tests (may fail until components are updated)
npm run storybook:test
```

### 3. Test Lighthouse CI Locally
```bash
# Build the application
npm run build

# Start the application
npm start &

# Run Lighthouse CI against local instance
npx lhci autorun --collect.url="http://localhost:3000"

# Stop the local server
pkill -f "next start"
```

## Workflow Testing

### 1. Create Test Pull Request
1. Create a new feature branch:
   ```bash
   git checkout -b test/preview-deployment
   git push -u origin test/preview-deployment
   ```

2. Create a simple change to trigger the workflow:
   ```bash
   echo "# Preview Deployment Test" >> TEST_PREVIEW.md
   git add TEST_PREVIEW.md
   git commit -m "test: verify preview deployment workflow"
   git push
   ```

3. Open a pull request from the test branch to `main`

### 2. Monitor Workflow Execution
1. Go to `Actions` tab in GitHub repository
2. Observe the following workflows:
   - **CI**: Should include new Storybook A11y job
   - **Preview Deployment**: Should deploy to Vercel and run Lighthouse CI
3. Check PR comments for:
   - Preview URL with live deployment link
   - Lighthouse CI results with accessibility scores

### 3. Verify Deployment
1. Click the preview URL in the PR comment
2. Verify the application loads correctly
3. Check Storybook is accessible at `[preview-url]/storybook-static`
4. Review Lighthouse CI results in workflow logs

## Troubleshooting

### Common Issues and Solutions

#### 1. Vercel Authentication Failures
```
Error: No credentials found for "vercel"
```
**Solution**: Verify `VERCEL_TOKEN` secret is correctly set and valid.

#### 2. Missing Organization/Project IDs
```
Error: Project not found
```
**Solution**: Double-check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` values from `vercel link`.

#### 3. Lighthouse CI Accessibility Failures
```
Assertion failed: categories:accessibility
```
**Solution**: Review accessibility issues in Lighthouse report and fix components:
- Add missing alt text for images
- Ensure proper heading hierarchy
- Add ARIA labels for interactive elements

#### 4. Storybook A11y Test Failures
```
Expected no accessibility violations
```
**Solution**: Use Storybook a11y addon to identify and fix violations:
- Check color contrast ratios
- Verify form labels are properly associated
- Ensure keyboard navigation works correctly

#### 5. Build Timeouts or Failures
```
Error: Process completed with exit code 1
```
**Solution**: Check build logs for specific errors:
- TypeScript compilation errors
- Missing dependencies
- Linting failures

### Debug Commands

```bash
# Check Vercel CLI configuration
vercel --version
vercel whoami

# Test Vercel deployment manually
vercel --prod

# Run Lighthouse with verbose output
npx lhci autorun --collect.url="[URL]" --upload.target="filesystem" --upload.outputDir="./lhci_reports"

# Check Storybook build output
npm run build-storybook 2>&1 | tee storybook-build.log

# Validate package.json scripts
npm run-script
```

## Maintenance and Updates

### Regular Maintenance Tasks

#### Monthly:
- Review Lighthouse CI reports for performance trends
- Update Lighthouse CI and Storybook dependencies
- Rotate Vercel access tokens (if security policy requires)

#### Quarterly:
- Review accessibility compliance and update guidelines
- Analyze deployment costs and optimize if necessary
- Update documentation based on team feedback

#### As Needed:
- Add new accessibility test patterns for new component types
- Adjust Lighthouse CI thresholds based on performance requirements
- Extend preview deployment workflow for additional environments

### Dependency Updates
```bash
# Update Lighthouse CI
npm update @lhci/cli

# Update Storybook packages
npm update @storybook/addon-a11y @storybook/test @storybook/addon-essentials

# Check for major version updates
npm outdated
```

### Security Considerations
- Regularly rotate Vercel access tokens
- Monitor preview deployment usage to prevent abuse
- Review GitHub Actions logs for sensitive data exposure
- Keep dependencies updated for security patches

## Success Criteria Verification

✅ **Preview Deployments**
- [ ] Every PR generates a unique preview URL
- [ ] Preview URL is posted in PR comments within 5 minutes
- [ ] Preview includes both main app and Storybook

✅ **Lighthouse CI Quality Gates**
- [ ] Accessibility score of 1.0 required for deployment
- [ ] Performance warnings appear for scores < 0.9
- [ ] SEO warnings appear for scores < 0.9
- [ ] Full Lighthouse reports available in workflow artifacts

✅ **Storybook A11y Testing**
- [ ] All stories automatically tested for accessibility
- [ ] A11y violations fail the CI build
- [ ] Accessibility feedback visible in Storybook interface

✅ **Documentation and Process**
- [ ] ADR documents created and linked in repository
- [ ] Team members understand new workflow requirements
- [ ] Accessibility guidelines documented and accessible
- [ ] Emergency procedures documented for workflow failures

## Support and Resources

### Internal Documentation
- [ADR-003: Preview Deployments](./adr/ADR-003-preview-deployments.md)
- [ADR-004: Lighthouse & A11y CI](./adr/ADR-004-lighthouse-a11y.md)
- [Accessibility Guide](./ACCESSIBILITY_GUIDE.md)

### External Resources
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Storybook A11y Addon](https://storybook.js.org/addons/@storybook/addon-a11y)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Getting Help
- **Workflow Issues**: Check GitHub Actions logs and create issue with `ci/cd` label
- **Accessibility Questions**: Reference accessibility guide or create issue with `accessibility` label
- **Vercel Problems**: Contact DevOps team with deployment logs
- **General Support**: Create GitHub issue with appropriate labels and detailed problem description
