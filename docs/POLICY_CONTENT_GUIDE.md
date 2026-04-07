# Policy Content Management Guide

## Overview

This guide explains how to create, edit, and maintain policy documents for the QuantumPoly Trust & Policies system. It's intended for content editors, legal reviewers, and documentation maintainers.

## Content Structure

### Directory Layout

Policy content is organized by type and locale:

```
content/policies/
├── ethics/
│   ├── en.md
│   ├── de.md
│   ├── tr.md
│   ├── es.md
│   ├── fr.md
│   └── it.md
├── gep/
│   └── [same locale structure]
├── privacy/
│   └── [same locale structure]
└── imprint/
    └── [same locale structure]
```

### Policy Types

**ethics** — Ethics & Transparency  
Covers ethical AI development, transparency commitments, and responsible practices.

**gep** — Good Engineering Practices  
Technical standards, development methodologies, and quality assurance.

**privacy** — Privacy Policy  
Data collection, usage, protection, and user rights.

**imprint** — Legal Notice (Impressum)  
Legal entity information, contact details, and regulatory compliance.

## Frontmatter Schema

Every policy file must include YAML frontmatter at the top. This metadata controls SEO, display, and review workflows.

### Required Fields

```yaml
---
title: "Policy Title"
summary: "Brief description (10+ characters, used for meta description)"
status: "draft" | "in-progress" | "published"
owner: "Team Name <email@quantumpoly.ai>"
lastReviewed: "YYYY-MM-DD"
nextReviewDue: "YYYY-MM-DD"
version: "v0.0.0"
---
```

### Field Descriptions

**title** (string, required)  
Page title and H1 heading. Keep concise (under 60 characters for SEO).

**summary** (string, required, min 10 chars)  
Brief description shown in page header and meta description. Aim for 120-160 characters.

**status** (enum, required)  
Publication state affects SEO and visibility:

- `draft` — Work in progress, not ready for review. **Sets `noindex` in robots meta.**
- `in-progress` — Under review or being translated. **Sets `noindex` in robots meta.**
- `published` — Finalized and publicly indexed. **Allows search engine indexing.**

**owner** (string, required)  
Team or individual responsible for content. Format: `Team Name <email@example.com>`

**lastReviewed** (ISO date, required)  
Date of last content review. Format: `YYYY-MM-DD` (e.g., `2025-10-13`)

**nextReviewDue** (ISO date, required)  
Target date for next review. Format: `YYYY-MM-DD`

**version** (string, required)  
Semantic version following `vMAJOR.MINOR.PATCH` (e.g., `v1.2.0`):

- **MAJOR:** Significant policy changes
- **MINOR:** New sections or clarifications
- **PATCH:** Typo fixes, formatting updates

### Validation

Frontmatter is validated at build time using Zod. Invalid frontmatter will **fail the build** with detailed error messages. Common issues:

- Missing required fields
- Invalid date format (must be `YYYY-MM-DD`)
- Invalid status value
- Malformed version string
- Summary too short (< 10 characters)

## Automated Validation & Merge Gates

### Purpose

Automated validation prevents policy documents from being published with missing metadata, malformed frontmatter, or overdue reviews. This system ensures:

- **Schema compliance** — All required fields are present and correctly formatted
- **Build integrity** — Invalid documents fail the build immediately, preventing deployment
- **Review accountability** — Overdue reviews trigger automated notifications
- **Quality gates** — CI prevents merging incomplete or non-compliant content

### How It Works

#### Zod Schema Validation

All policy frontmatter is validated against a strict [Zod schema](../src/lib/policies/policy-schema.ts) at build time. The schema enforces:

- **Required fields** — title, summary, status, owner, lastReviewed, nextReviewDue, version
- **Type safety** — Each field must match its expected type (string, enum, date)
- **Format constraints** — Dates must be ISO 8601 (YYYY-MM-DD), versions must follow semver (v1.0.0)
- **Content rules** — Summary must be at least 10 characters

**Example Zod Schema:**

```typescript
export const policyMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  status: z.enum(['draft', 'in-progress', 'published']),
  owner: z.string().min(1, 'Owner is required'),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date (YYYY-MM-DD)'),
  nextReviewDue: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be ISO date (YYYY-MM-DD)'),
  version: z.string().regex(/^v\d+\.\d+\.\d+$/, 'Must follow semver (v1.0.0)'),
});
```

#### Overdue Review Detection

The CI workflow runs `scripts/validate-policy-reviews.ts` to detect overdue reviews. A policy is considered overdue if:

1. **Due date passed:** `nextReviewDue < today (UTC)`
2. **Stale review:** `lastReviewed > 180 days ago`

Overdue reviews trigger automated PR comments but **do not fail the build**.

### Running Validation Locally

#### Full validation suite

```bash
npm run validate
```

Runs: lint + type-check + tests. Use before committing changes.

#### Policy review validation

```bash
npm run validate:policy-reviews
```

Generates `validation_output.json` with:

- Schema errors (fails if found)
- Overdue reviews (warnings only)
- Summary statistics

#### Type checking

```bash
npm run type-check
```

Verifies TypeScript compilation without emitting files.

### CI Integration

#### Build-time validation

Every policy document is validated during `next build`. Invalid frontmatter causes immediate build failure with detailed error messages:

```
Error: Invalid frontmatter in policy "ethics" (locale: en):
  - lastReviewed: lastReviewed must be ISO date (YYYY-MM-DD)
  - version: version must follow semantic versioning (e.g., v1.0.0)

Ensure all required fields are present and correctly formatted.
```

#### Pull Request validation

The [`.github/workflows/policy-validation.yml`](../.github/workflows/policy-validation.yml) workflow runs on:

- **Pull requests** modifying `content/policies/**`
- **Nightly** (2 AM UTC)
- **Manual dispatch**

**Workflow steps:**

1. Checkout code and install dependencies
2. Run `validate-policy-reviews.ts` → generates JSON
3. **Fail on schema errors** (required fields missing, malformed data)
4. **Comment on overdue reviews** (does not fail build)
5. Upload `validation_output.json` artifact

**Permissions:** `contents: read`, `pull-requests: write`

### Pre-commit Hooks

[lint-staged](../lint-staged.config.mjs) runs validation on staged files before commit:

- **ESLint** checks for code style issues
- **Prettier** formats code consistently
- **Type checking** validates TypeScript

Configure in `.lintstagedrc` or `lint-staged.config.mjs`.

### Common Errors & Fixes

| Field Error             | Rule                          | Error Message                                            | Fix                                                                       |
| ----------------------- | ----------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Missing title**       | Required                      | `Title is required`                                      | Add `title: "Policy Title"` to frontmatter                                |
| **Short summary**       | Min 10 chars                  | `Summary must be at least 10 characters`                 | Expand summary to meaningful description (120-160 chars ideal)            |
| **Invalid status**      | Enum                          | `Status must be draft, in-progress, or published`        | Use one of: `status: "draft"` \| `"in-progress"` \| `"published"`         |
| **Invalid date format** | Regex `/^\d{4}-\d{2}-\d{2}$/` | `lastReviewed must be ISO date (YYYY-MM-DD)`             | Format as `2025-10-17` (not `10/17/2025` or `17-10-2025`)                 |
| **Invalid version**     | Regex `/^v\d+\.\d+\.\d+$/`    | `version must follow semantic versioning (e.g., v1.0.0)` | Use format `v1.2.3` (not `1.2.3` or `v1.2`)                               |
| **Missing owner**       | Required                      | `Owner is required`                                      | Add `owner: "Team Name <email@example.com>"`                              |
| **Malformed YAML**      | Parse error                   | `Unexpected token in frontmatter`                        | Check for unbalanced quotes, incorrect indentation, or special characters |

### Typical Error & Fix Example

**Error:**

```
Error: Invalid frontmatter in policy "privacy" (locale: es):
  - lastReviewed: lastReviewed must be ISO date (YYYY-MM-DD)
  - version: version must follow semantic versioning (e.g., v1.0.0)
```

**Before (incorrect):**

```yaml
---
title: 'Privacy Policy'
summary: 'Our privacy practices'
status: 'published'
owner: 'Privacy Team <privacy@quantumpoly.ai>'
lastReviewed: 'October 13, 2025' # ❌ Wrong format
nextReviewDue: '2026-01-13'
version: '1.0.0' # ❌ Missing 'v' prefix
---
```

**After (correct):**

```yaml
---
title: 'Privacy Policy'
summary: 'Our privacy practices'
status: 'published'
owner: 'Privacy Team <privacy@quantumpoly.ai>'
lastReviewed: '2025-10-13' # ✅ ISO format
nextReviewDue: '2026-01-13'
version: 'v1.0.0' # ✅ Semver with 'v' prefix
---
```

### Review Cadence Fields

The `lastReviewed` and `nextReviewDue` fields power the overdue detection system:

- **lastReviewed** — Date of last comprehensive content review
- **nextReviewDue** — Target date for next scheduled review
- **Overdue threshold** — Policies are flagged if `nextReviewDue` passes or `lastReviewed > 180 days ago`

When reviews are completed:

1. Update `lastReviewed` to current date
2. Calculate and set new `nextReviewDue` (typically +90 days for critical policies, +365 days for stable content)
3. Increment `version` if content changed

See [Review Cadence](#review-cadence) section for detailed review procedures.

### Cross-References

- **Policy schema definition:** [`src/lib/policies/policy-schema.ts`](../src/lib/policies/policy-schema.ts)
- **Validation script:** [`scripts/validate-policy-reviews.ts`](../scripts/validate-policy-reviews.ts)
- **CI workflow:** [`.github/workflows/policy-validation.yml`](../.github/workflows/policy-validation.yml)
- **Unit tests:** [`__tests__/lib/policies/policy-schema.test.ts`](../__tests__/lib/policies/policy-schema.test.ts)
- **Overdue detection tests:** [`__tests__/lib/policies/overdue-detection.test.ts`](../__tests__/lib/policies/overdue-detection.test.ts)

## Content Guidelines

### Writing Style

**Be clear and precise**  
Avoid marketing language. Use specific, technical terms when appropriate.

**Use neutral, inclusive language**  
Respect diverse audiences. Avoid assumptions about user background, location, or capabilities.

**Be cautious with legal content**  
Privacy and Imprint pages should include disclaimers: _"This document is provided for informational purposes only and does not constitute legal advice."_

**Structure for scannability**  
Use headings (H2, H3), bullet lists, and short paragraphs. Users should be able to skim quickly.

### Markdown Formatting

**Headings**

- H1 is reserved for the page title (from frontmatter)
- Use H2 (`##`) for major sections
- Use H3 (`###`) for subsections
- Headings at levels 2-3 are auto-included in the table of contents

**Lists**

```markdown
- Unordered lists for non-sequential items
- Start each item with a capital letter
- End with periods if items are complete sentences

1. Ordered lists for sequential steps
2. Number automatically increments
3. Useful for procedures or rankings
```

**Emphasis**

```markdown
_Italic_ for emphasis or technical terms
**Bold** for strong emphasis or key concepts
`Code` for technical identifiers, commands, or code
```

**Links**

```markdown
[Link text](/en/privacy) — Internal link
[External link](https://example.com) — External link
```

### Content Organization

**Introduction section**  
Start with context: what is this policy, why does it matter, and who should read it?

**Core sections**  
Group related content under clear H2 headings. Each section should cover one main topic.

**Contact information**  
Include relevant contact emails or forms. Format:

```markdown
Email: team@quantumpoly.ai
```

**Disclaimer (for Privacy/Imprint)**  
Add at the end:

```markdown
## Disclaimer

This document is provided for informational purposes only and does not constitute legal advice. For specific concerns, please consult appropriate professional advisors.
```

## Translation Workflow

### Translation Priority

1. **English (en)** — Master content, always most complete
2. **German (de), Turkish (tr)** — Full translations maintained
3. **Spanish (es), French (fr), Italian (it)** — In-progress translations with English fallback

### Creating Translations

1. **Copy the English file** as a starting point:

   ```bash
   cp content/policies/ethics/en.md content/policies/ethics/fr.md
   ```

2. **Update frontmatter:**
   - Translate `title` and `summary`
   - Set `status: "in-progress"` initially
   - Keep same `version`, `lastReviewed`, `nextReviewDue`
   - Keep same `owner`

3. **Translate content:**
   - Translate all headings, body text, and lists
   - Keep markdown formatting identical
   - Maintain same heading structure (for TOC consistency)
   - Keep links and email addresses unchanged

4. **Review and publish:**
   - Have native speaker review
   - Update `status: "published"` when finalized
   - Increment `version` patch number if needed

### Fallback Behavior

When a user requests a locale that doesn't exist (or has `status: "in-progress"`), the system automatically:

- Loads the English version
- Shows a banner: _"Translation in progress — showing English content for now."_
- Sets `isFallback: true` in the layout

## Review Cadence

### Regular Reviews

**Quarterly reviews** for high-priority policies (Ethics, Privacy):

- Check for outdated information
- Verify contact details
- Update `lastReviewed` date
- Set new `nextReviewDue` (typically +3 months)

**Annual reviews** for stable policies (GEP, Imprint):

- Comprehensive content audit
- Regulatory compliance check
- Update `lastReviewed` and `nextReviewDue`

### Triggering Reviews

Reviews should be triggered when:

- Major product changes affect policy content
- Legal or regulatory requirements change
- User feedback highlights confusion
- Industry best practices evolve
- Security incidents require policy updates

### Review Process

1. **Schedule review** in advance of `nextReviewDue` date
2. **Assign reviewers** (content owner + subject matter expert)
3. **Update content** as needed
4. **Update metadata:**
   - Increment `version` appropriately
   - Update `lastReviewed` to review date
   - Set `nextReviewDue` (+3 or +12 months)
5. **Test locally** to ensure valid frontmatter
6. **Commit with descriptive message**
7. **Verify in staging** before production deployment

## Version Control

### Version Numbering

Follow semantic versioning for policy documents:

**MAJOR (v2.0.0)**  
Breaking changes or complete rewrites:

- Fundamental policy changes
- Major legal requirements
- Restructured content

**MINOR (v1.1.0)**  
Additive changes:

- New sections or subsections
- Additional clarifications
- Expanded coverage

**PATCH (v1.0.1)**  
Non-substantive changes:

- Typo fixes
- Formatting improvements
- Contact information updates
- Translation updates

### Commit Messages

Use clear, descriptive commit messages:

```
✅ Good:
- "Update Ethics policy: add AI safety section (v1.2.0)"
- "Fix typo in Privacy policy DE translation"
- "Quarterly review: Ethics, Privacy (2025-Q4)"

❌ Bad:
- "update"
- "changes"
- "fix stuff"
```

## Common Tasks

### Adding a New Policy Type

1. Create directory: `content/policies/newpolicy/`
2. Add entry to `POLICY_SLUGS` in `src/lib/policies/policySchema.ts`
3. Create page: `src/app/[locale]/newpolicy/page.tsx`
4. Create content files for all 6 locales
5. Update documentation

### Updating Contact Information

Search and replace across all locales:

```bash
grep -r "oldteam@quantumpoly.ai" content/policies/
# Then update each file
```

### Bulk Status Update

When finalizing multiple translations:

```bash
# Carefully edit frontmatter in each file
# Change status: "in-progress" → status: "published"
# Update version if content changed
```

## Troubleshooting

### Build Fails with Frontmatter Error

**Symptom:** Build fails with Zod validation error

**Solution:**

1. Read the error message carefully (shows field and issue)
2. Check frontmatter format:
   - Dates must be `YYYY-MM-DD`
   - Status must be `draft`, `in-progress`, or `published`
   - Version must be `v0.0.0` format
3. Ensure all required fields present
4. Check for YAML syntax errors (indentation, quotes)

### TOC Not Showing

**Symptom:** Table of contents sidebar is empty

**Solution:**

- Add H2 (`##`) or H3 (`###`) headings to content
- Ensure headings have text content
- Check that headings use proper markdown syntax

### Fallback Banner Shows for Published Content

**Symptom:** English fallback notice appears even though translation exists

**Solution:**

- Verify file exists at correct path: `content/policies/{slug}/{locale}.md`
- Check file has valid frontmatter
- Ensure no typos in locale code (must be exactly `en`, `de`, `tr`, `es`, `fr`, or `it`)

## Best Practices

### Checklist for New Content

- [ ] Valid frontmatter with all required fields
- [ ] Appropriate `status` (start with `draft` or `in-progress`)
- [ ] Clear, scannable structure with H2/H3 headings
- [ ] Neutral, inclusive language
- [ ] Disclaimer added (for Privacy/Imprint)
- [ ] Contact information included
- [ ] Tested locally before committing
- [ ] Translations planned for priority locales

### Checklist for Reviews

- [ ] Content still accurate and current
- [ ] Links and contact information valid
- [ ] Regulatory requirements met
- [ ] `lastReviewed` date updated
- [ ] `nextReviewDue` set appropriately
- [ ] `version` incremented if content changed
- [ ] All locales reviewed (or marked for translation)

## Resources

### Related Documentation

- [I18N Guide](./I18N_GUIDE.md) — Internationalization patterns
- [ADR-006](./adr/ADR-006-multi-agent-cognitive-architecture.md) — Architecture decisions
- [Accessibility Guide](./ACCESSIBILITY_GUIDE.md) — WCAG compliance

### External References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Semantic Versioning](https://semver.org/)
- [GDPR Summary](https://gdpr.eu/what-is-gdpr/)
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/)

## Support

For questions about policy content management:

**Content Team**  
Email: content@quantumpoly.ai

**Technical Issues**  
Email: engineering@quantumpoly.ai

---

**Last Updated:** October 13, 2025  
**Document Version:** v1.0.0
