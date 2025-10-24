<!-- FILE: CHANGELOG.policy.md -->

# Changelog Policy & Release Notes

**Version:** 1.0  
**Last Updated:** 2025-10-21  
**Audience:** Developers, Release Managers, Technical Writers  
**Classification:** Development Standards

---

## Purpose

This document defines the changelog format, versioning scheme, release notes requirements, and reviewer sign-off process for QuantumPoly deployments. Adherence to this policy ensures consistent, auditable, and transparent release communication.

---

## Changelog Format

### Standard: Keep a Changelog

QuantumPoly follows the **Keep a Changelog** format (https://keepachangelog.com/en/1.0.0/).

**Core Principles:**

- Changelog is for humans, not machines
- One entry per version
- Same types of changes grouped together
- Versions and dates listed in reverse chronological order
- Unreleased changes tracked at top

---

### Changelog File Location

**Repository Path:** `CHANGELOG.md` (root directory)

**Example Structure:**

```markdown
# Changelog

All notable changes to QuantumPoly will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New feature in progress

### Changed

- Modification not yet released

## [1.0.1] - 2025-10-21

### Fixed

- Fix accessibility violation in Hero component (#123)
- Correct typo in policy page (PR #124)

### Security

- Update dependencies to patch CVE-2025-XXXX

## [1.0.0] - 2025-10-15

### Added

- Initial public release
- Governance dashboard with EII scoring
- CI/CD pipeline with quality gates

### Documentation

- Complete CI/CD documentation suite
- Accessibility testing guide
```

---

### Change Categories

Use the following categories (in this order):

| Category       | Description                                    | Examples                                                                |
| -------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| **Added**      | New features, components, pages                | New contact form, dark mode toggle, blog section                        |
| **Changed**    | Changes to existing functionality              | Update button styling, refactor API endpoint, improve performance       |
| **Deprecated** | Features marked for removal in future versions | Legacy API v1 deprecated (use v2)                                       |
| **Removed**    | Features removed in this release               | Remove unused polyfills, delete deprecated API                          |
| **Fixed**      | Bug fixes                                      | Fix form validation, correct calculation error, resolve console warning |
| **Security**   | Security patches, vulnerability fixes          | Patch XSS vulnerability, update vulnerable dependencies                 |

**Note:** Not all categories required in every release. Only include categories with changes.

---

### Entry Format

**Format:** `- <Description> (<PR/Issue/Link>)`

**Examples:**

```markdown
### Added

- Governance ledger with cryptographic verification (#142, PR #145)
- Accessibility testing with Playwright and axe-core (PR #138)

### Changed

- Improve bundle size by 15% through code splitting (#130, PR #131)
- Update Next.js from 14.0.0 to 14.2.0 (PR #140)

### Fixed

- Fix newsletter form submission on mobile (#125, PR #126)
- Correct color contrast ratio in Hero component for WCAG compliance (#128)

### Security

- Update axios from 1.5.0 to 1.6.2 to patch CVE-2023-XXXX (PR #135)
- Implement Content Security Policy headers (#137)
```

---

## Versioning (Semantic Versioning)

QuantumPoly follows **Semantic Versioning 2.0.0** (https://semver.org/).

**Format:** `MAJOR.MINOR.PATCH`

**Version Components:**

| Component | Increment When                             | Examples          |
| --------- | ------------------------------------------ | ----------------- |
| **MAJOR** | Incompatible API changes, breaking changes | `1.0.0` → `2.0.0` |
| **MINOR** | New features (backward compatible)         | `1.0.0` → `1.1.0` |
| **PATCH** | Bug fixes (backward compatible)            | `1.0.0` → `1.0.1` |

---

### Version Increment Guidelines

**PATCH Version (`x.x.1`):**

- Bug fixes
- Typo corrections
- Dependency updates (security patches)
- Performance improvements (no API changes)
- Documentation updates

**Example:** `1.0.0` → `1.0.1`

```
- Fix newsletter form validation
- Correct spelling errors in About page
- Update lodash to patch security vulnerability
```

---

**MINOR Version (`x.1.0`):**

- New features (backward compatible)
- New components
- New pages
- Deprecations (without removal)
- Significant performance improvements

**Example:** `1.0.1` → `1.1.0`

```
- Add blog section with RSS feed
- Implement dark mode toggle
- Add i18n support for French and German
```

---

**MAJOR Version (`2.0.0`):**

- Breaking changes to public APIs
- Removal of deprecated features
- Major architectural changes
- Incompatible updates requiring user action

**Example:** `1.5.0` → `2.0.0`

```
- Remove legacy API v1 (deprecated in 1.3.0)
- Change URL structure for policy pages (/policies/* → /legal/*)
- Update minimum Node.js version from 16.x to 18.x
```

**Note:** For pre-release versions, use: `1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`

---

### Special Version Tags

| Tag Type                   | Format            | Use Case                          |
| -------------------------- | ----------------- | --------------------------------- |
| **Hotfix**                 | `v1.0.1-hotfix`   | Emergency production fix          |
| **Rollback**               | `v1.0.2-rollback` | Rollback to previous version      |
| **RC (Release Candidate)** | `v2.0.0-rc.1`     | Pre-release testing               |
| **Beta**                   | `v2.0.0-beta.1`   | Feature preview (unstable)        |
| **Alpha**                  | `v2.0.0-alpha.1`  | Early development (very unstable) |

---

## Release Notes Requirements

### GitHub Release Template

When creating a GitHub Release, use the following template:

```markdown
# [Version] - [Release Name]

**Release Date:** YYYY-MM-DD  
**Type:** Standard / Hotfix / Rollback  
**CI Run:** [Link to GitHub Actions run]

---

## 🎯 Highlights

[Brief summary of the most important changes in 1-3 sentences]

---

## 📋 Changes

### ✨ Added

- [Feature 1] (#PR_NUMBER)
- [Feature 2] (#PR_NUMBER)

### 🔄 Changed

- [Change 1] (#PR_NUMBER)
- [Change 2] (#PR_NUMBER)

### 🐛 Fixed

- [Fix 1] (#PR_NUMBER, fixes #ISSUE_NUMBER)
- [Fix 2] (#PR_NUMBER, fixes #ISSUE_NUMBER)

### 🔒 Security

- [Security fix 1] (CVE-YYYY-XXXXX, #PR_NUMBER)
- [Dependency update] (#PR_NUMBER)

---

## 📊 Quality Metrics

**CI Quality Gates:** ✅ All passed  
**EII Score:** XX.X / 100  
**Test Coverage:** XX%  
**Accessibility:** WCAG 2.1 Level AA compliant  
**Performance:** Lighthouse score ≥90

---

## 🔗 Links

- **Staging Validation:** [Staging URL]
- **CI Workflow:** [GitHub Actions run URL]
- **Governance Ledger:** [Ledger entry URL or commit]
- **Full Changelog:** [CHANGELOG.md link]

---

## ✅ Deployment Checklist

Completed before production deployment:

- [x] All CI quality gates passed
- [x] Staging deployment validated
- [x] EII score ≥ 90
- [x] Release notes complete
- [x] Breaking changes documented (if any)
- [x] Migration guide provided (if needed)

---

## 🔐 Security Notes

[If this release includes security fixes, provide details here]

**Affected Versions:** [List versions with vulnerability]  
**CVE ID:** CVE-YYYY-XXXXX (if applicable)  
**Severity:** Critical / High / Medium / Low  
**Recommendation:** Users should upgrade immediately to [version]

---

## 🚀 Upgrade Instructions

### For Developers

\`\`\`bash
git pull origin main
npm install
npm run build
\`\`\`

### For Production

Deployment via standard release workflow (tag → release → manual approval).

### Breaking Changes (if any)

[Document any breaking changes and migration steps]

---

## 👥 Contributors

Thanks to the following contributors for this release:

- @username1
- @username2

---

## 📝 Notes

[Any additional context, known issues, or future work]

---

**Approved By:** [Approver name]  
**Approval Date:** YYYY-MM-DD HH:MM UTC  
**Deployed At:** [Deployment timestamp]  
**Governance Ledger Entry:** [Ledger ID: YYYY-MM-DD-XXX]
```

---

## Entry Requirements (Mandatory Links)

Each changelog entry and GitHub Release **must** include:

| Requirement              | Format                                                      | Purpose                             |
| ------------------------ | ----------------------------------------------------------- | ----------------------------------- |
| **Pull Request Link**    | `(PR #123)` or `(#123)`                                     | Traceability to code changes        |
| **Issue Link**           | `(fixes #456)` or `(closes #456)`                           | Link fix to reported issue          |
| **CI Run ID**            | `[CI Run](https://github.com/org/repo/actions/runs/123456)` | Evidence of quality gate compliance |
| **Commit SHA**           | `(abc1234)`                                                 | Exact commit deployed               |
| **Approver**             | `Approved by: @username`                                    | Accountability                      |
| **Deployment Timestamp** | `Deployed at: 2025-10-21T14:30:00Z`                         | Audit trail                         |

**Example with All Requirements:**

```markdown
### Fixed

- Fix accessibility violation in Hero component (#128, PR #130, fixes #125, commit: abc1234)
  - CI Run: https://github.com/quantumpoly/quantumpoly/actions/runs/789012
  - Approved by: @devops-lead
  - Deployed at: 2025-10-21T14:30:00Z
```

---

## Reviewer Sign-Off Process

### Pre-Release Review

Before creating a GitHub Release:

**Reviewer Checklist:**

- [ ] All changelog entries accurate and complete
- [ ] Version number follows SemVer rules
- [ ] PR/issue links verified (all links valid)
- [ ] Security notes included (if applicable)
- [ ] Breaking changes documented (if any)
- [ ] CI quality gates all passed
- [ ] EII score ≥ 90 (from governance job)
- [ ] Staging deployment validated
- [ ] Release notes follow template

**Reviewer Roles:**

- **Technical Review:** DevOps Lead or Engineering Manager
- **Content Review:** Technical Writer or Product Owner (if available)
- **Compliance Review:** Compliance Officer (for major releases)

---

### Sign-Off Format

**In GitHub Release:**

```markdown
## Reviewer Sign-Off

**Technical Reviewer:** @devops-lead  
**Review Date:** 2025-10-21  
**Approval:** ✅ Approved for production deployment

**Compliance Reviewer:** @compliance-officer  
**Review Date:** 2025-10-21  
**Approval:** ✅ Governance requirements met (EII: 93.5)

**Deployment Approver:** @product-owner  
**Approval Date:** 2025-10-21T14:30:00Z  
**Approval Method:** GitHub Environment manual approval
```

**In Commit Message (for CHANGELOG.md updates):**

```
docs: update changelog for v1.0.1

- Add release notes for v1.0.1
- Document security fixes (CVE-2025-XXXX)
- Include all PR links and CI run IDs

Reviewed-by: @devops-lead
Signed-off-by: @release-manager
```

---

## Changelog Maintenance Workflow

### Step 1: Update Unreleased Section (Continuous)

**When:** After every PR merge to `main`

**Who:** PR author or merge approver

**Process:**

```bash
# Edit CHANGELOG.md
# Add entry under [Unreleased] section
# Categorize appropriately (Added/Changed/Fixed/etc.)

git add CHANGELOG.md
git commit -m "docs: update changelog for PR #123"
git push origin main
```

**Example:**

```markdown
## [Unreleased]

### Added

- New contact form with spam protection (PR #145)

### Fixed

- Fix mobile navigation menu z-index (PR #147, fixes #146)
```

---

### Step 2: Prepare Release (Pre-Tag)

**When:** Before creating Git tag for release

**Who:** Release manager or DevOps lead

**Process:**

```bash
# 1. Move [Unreleased] changes to new version section
# 2. Add version number and date
# 3. Add links at bottom of changelog

# Example diff:
# ## [Unreleased]
# (empty or new in-progress changes)
#
# ## [1.0.1] - 2025-10-21
# ### Fixed
# - Fix mobile navigation menu z-index (PR #147, fixes #146)

# 4. Commit changelog
git add CHANGELOG.md
git commit -m "docs: release v1.0.1 changelog"
git push origin main

# 5. Create tag
git tag v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

---

### Step 3: Create GitHub Release (Manual)

**When:** After tag is pushed

**Who:** Release manager with approval authority

**Process:**

1. Navigate to: Repository → Releases → "Draft a new release"
2. Select tag: `v1.0.1`
3. Release title: `v1.0.1 - [Release Name]`
4. Copy release notes from template (fill in details)
5. Attach any binary assets (if applicable)
6. Check "Set as latest release"
7. Click "Publish release"

**Triggers:** Publishing the release triggers production deployment workflow

---

## Changelog Verification

### Automated Checks (Proposed)

Add to CI workflow:

```yaml
- name: Verify changelog updated
  run: |
    # Check if CHANGELOG.md was modified in this PR
    git diff origin/main --name-only | grep -q "CHANGELOG.md" || {
      echo "❌ CHANGELOG.md not updated"
      exit 1
    }
```

---

### Manual Checks

Before approving PR with changelog changes:

- [ ] Entry in correct version section (Unreleased vs. versioned)
- [ ] Entry in correct category (Added/Changed/Fixed/etc.)
- [ ] Description clear and user-facing (not technical jargon)
- [ ] PR link included
- [ ] Issue link included (if fixing a bug)
- [ ] No duplicate entries
- [ ] Alphabetical or logical ordering within category

---

## Version Comparison Links

**Format (at bottom of CHANGELOG.md):**

```markdown
[Unreleased]: https://github.com/quantumpoly/quantumpoly/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/quantumpoly/quantumpoly/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/quantumpoly/quantumpoly/releases/tag/v1.0.0
```

**Purpose:** Enables users to view all commits between versions via GitHub compare view

---

## Security Release Notes (Special Requirements)

For releases including security fixes:

### CVE Disclosure

**Timing:**

- Disclose CVE details **after** patch is deployed to production
- Coordinate with security team and affected parties
- Provide 7-day advance notice to enterprise users (if applicable)

**Format:**

```markdown
## 🔒 Security Advisory

**CVE ID:** CVE-2025-XXXX  
**Severity:** Critical (CVSS 9.1)  
**Affected Versions:** v1.0.0 - v1.0.5  
**Fixed in:** v1.0.6  
**Disclosure Date:** 2025-10-21

### Vulnerability Description

[Detailed description of vulnerability]

### Impact

[Who is affected and how]

### Mitigation

Users should immediately upgrade to v1.0.6 or later.

### Workaround (if upgrade not possible)

[Temporary mitigation steps, if any]

### Credits

Discovered by: [Security researcher name/org]

### Timeline

- 2025-10-10: Vulnerability reported
- 2025-10-15: Fix developed and tested
- 2025-10-21: Patch released (v1.0.6)
- 2025-10-21: CVE published
```

---

## Deprecation Notices

When deprecating a feature:

**Format:**

```markdown
### Deprecated

- **Legacy API v1** will be removed in v2.0.0 (scheduled for 2026-Q1)
  - Deprecated since: v1.5.0
  - Migration guide: [Link to migration docs]
  - Replacement: Use API v2 (see documentation)
  - Timeline: 6-month deprecation period
```

**Requirements:**

- Provide at least one major version notice before removal
- Include migration guide
- Specify timeline for removal
- Provide alternative/replacement

---

## Changelog Examples (Real-World Scenarios)

### Example 1: Patch Release (Bug Fix)

**Version:** `1.0.0` → `1.0.1`

```markdown
## [1.0.1] - 2025-10-21

### Fixed

- Fix newsletter form submission failing on Safari (#125, PR #127, fixes #123)
- Correct color contrast ratio in Hero component (WCAG 1.4.3) (#128, PR #130)
- Resolve console warning in LanguageSwitcher component (#131, PR #132)

### Security

- Update axios from 1.5.0 to 1.6.2 (CVE-2023-XXXX) (PR #133)

**Links:**

- CI Run: https://github.com/quantumpoly/quantumpoly/actions/runs/789012
- Staging Validation: https://quantumpoly-staging.vercel.app
- Approved by: @devops-lead
- Deployed: 2025-10-21T14:30:00Z
```

---

### Example 2: Minor Release (New Features)

**Version:** `1.0.1` → `1.1.0`

```markdown
## [1.1.0] - 2025-11-01

### Added

- Governance dashboard with EII score visualization (#140, PR #142)
- French and German i18n support (#145, PR #150)
- Dark mode toggle with system preference detection (#155, PR #160)

### Changed

- Improve bundle size by 18% through code splitting (#162, PR #165)
- Update Hero component with new branding (#170, PR #172)

### Fixed

- Fix mobile menu z-index issue on iOS (#175, PR #177, fixes #174)

**Links:**

- CI Run: https://github.com/quantumpoly/quantumpoly/actions/runs/801234
- EII Score: 94.2
- Coverage: 87%
- Approved by: @product-owner
- Deployed: 2025-11-01T10:00:00Z
```

---

### Example 3: Major Release (Breaking Changes)

**Version:** `1.5.0` → `2.0.0`

```markdown
## [2.0.0] - 2026-01-15

### ⚠️ BREAKING CHANGES

- **API v1 Removed:** Legacy API endpoints removed (deprecated in v1.5.0)
  - Migration: Use API v2 (see [migration guide](docs/api-v2-migration.md))
- **URL Structure Changed:** Policy pages moved from `/policies/*` to `/legal/*`
  - SEO: 301 redirects configured for old URLs
- **Node.js 16.x Support Dropped:** Minimum version now 18.x
  - Update: `package.json` engines field enforces Node 18+

### Added

- Complete redesign with improved accessibility and performance (#200, PR #205)
- Real-time collaboration features (#210, PR #215)
- Advanced analytics dashboard (#220, PR #225)

### Removed

- Legacy API v1 endpoints (#230, PR #232)
- Unused polyfills (IE11 support) (#235, PR #237)

**Upgrade Instructions:**
See [UPGRADE_v2.md](docs/UPGRADE_v2.md) for detailed migration steps.

**Links:**

- CI Run: https://github.com/quantumpoly/quantumpoly/actions/runs/900123
- Migration Guide: [docs/UPGRADE_v2.md](docs/UPGRADE_v2.md)
- Approved by: @cto, @compliance-officer
- Deployed: 2026-01-15T08:00:00Z
```

---

## Related Documentation

| Document                          | Relevance                                           |
| --------------------------------- | --------------------------------------------------- |
| `README.CI-CD.md`                 | How changelogs integrate with deployment workflow   |
| `GOVERNANCE.rationale.md`         | Change categories and approval requirements         |
| `TROUBLESHOOTING.and.ROLLBACK.md` | Rollback procedures when releases fail              |
| `CONTRIBUTING.md`                 | Contribution guidelines including changelog updates |

---

## Tools & Automation (Future Enhancements)

**Proposed Tools:**

- **Conventional Commits:** Enforce commit message format to auto-generate changelogs
- **Release Drafter:** Auto-draft GitHub Releases based on PR labels
- **Changelog CI:** Automated changelog validation in pull requests

**Implementation Status:** Proposed for future consideration

---

**Document Version:** 1.0  
**Last Reviewed:** 2025-10-21  
**Next Review:** 2026-01-21 (Quarterly)  
**Maintained By:** DevOps Team & Technical Writing Team
