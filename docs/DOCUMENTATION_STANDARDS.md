# Documentation Standards

**Living Documentation for Living Systems**

This document defines standards for creating, maintaining, and evolving documentation within the QuantumPoly project. Documentation is treated as a first-class citizen, requiring the same rigor as code.

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Review Cycle:** Quarterly or upon major process changes

---

## Philosophical Foundation

### Documentation as a Public Good

Documentation serves multiple audiences with different needs:

- **New Contributors:** Need clear onboarding and conceptual overviews
- **Experienced Developers:** Need precise technical references
- **Governance Reviewers:** Need ethical context and evidence
- **External Stakeholders:** Need transparency and accountability

### Living Document Principle

Documentation is **never finished**—it evolves with the system:

- Code changes require documentation updates
- Process improvements trigger doc revisions
- User feedback shapes clarity and completeness
- Archival policies prevent documentation debt

---

## Documentation Categories

### 1. Onboarding Documentation

**Purpose:** Help new contributors join responsibly with clear understanding of project maturity, capabilities, limitations, and ethical obligations.

**Primary File:**

- `ONBOARDING.md` — Governance-first onboarding guide (5-section structure)
  - Section 1: Project Overview & Maturity
  - Section 2: Technical Setup & Dependencies
  - Section 3: Ethical Guidelines & Review Obligations
  - Section 4: Known Limitations & Open Research Areas
  - Section 5: Reference Materials & Source of Truth

**Supporting Files:**

- `docs/onboarding/DEVELOPER_QUICKSTART.md` — Fast-track for developers (if available)
- `docs/onboarding/ETHICAL_REVIEWER_GUIDE.md` — Ethics review process (if available)
- `docs/onboarding/CONTRIBUTOR_PERSONAS.md` — Role-specific paths (if available)
- `archive/ONBOARDING_legacy_v1.md` — Historical version for reference

**Standards:**

- Written for multi-stakeholder audiences (engineers, ethics reviewers, accessibility experts, governance teams)
- Assumes intelligence, not context
- No hype, marketing language, or certainty claims
- Honest about project maturity and limitations
- Include step-by-step technical instructions
- Provide expected outcomes for verification
- Link to evidence and source of truth
- Mandatory final reminder about review requirements
- Estimated time to complete sections
- Troubleshooting for common issues

**Tone Requirements:**

- Cautious, transparent, inclusive
- Evidence-based claims only
- Replace promises with conditional framing
- Shows respect for end users, partners, reviewers
- Encourages responsible contribution

**Review Cycle:** Quarterly or when onboarding process, maturity stage, or ethical guidelines change

---

### 2. Technical Reference Documentation

**Purpose:** Provide precise, authoritative information for experienced contributors.

**Files:**

- `README.md` — Quick technical reference
- `docs/I18N_GUIDE.md` — Internationalization deep dive
- `docs/ACCESSIBILITY_TESTING.md` — A11y testing comprehensive guide
- `docs/FINAL_REVIEW_CHECKLIST.md` — Pre-launch audit procedures

**Standards:**

- Concise and technically accurate
- Include code examples and commands
- Reference official documentation (Next.js, TypeScript, etc.)
- Maintain table of contents for long documents
- Version technical details (e.g., "As of Next.js 14.x...")

**Review Cycle:** When related code or tools change

---

### 3. Strategic Documentation

**Purpose:** Define vision, roadmap, and architectural decisions.

**Files:**

- `MASTERPLAN.md` — Project phases and roadmap
- `docs/STRATEGIC_ROADMAP.md` — Future feature architecture
- `BLOCK*_IMPLEMENTATION_SUMMARY.md` — Historical implementation records

**Standards:**

- Include rationale for decisions
- Document alternatives considered
- Reference evidence or research
- Connect to governance principles
- Maintain change log

**Review Cycle:** Quarterly or at major project milestones

---

### 4. Process Documentation

**Purpose:** Define workflows, standards, and procedures.

**Files:**

- `CONTRIBUTING.md` — Contribution workflow
- `docs/DOCUMENTATION_STANDARDS.md` — This document
- `.github/workflows/*.yml` — CI/CD process (inline comments)

**Standards:**

- Step-by-step procedures
- Clear ownership and approval chains
- Examples of good and bad practices
- References to related processes
- Versioned with semantic versioning

**Review Cycle:** When processes change or after retrospectives

---

### 5. Governance Documentation

**Purpose:** Document ethical principles, policies, and transparency commitments.

**Files:**

- `content/policies/ethics/en.md` — Ethics policy
- `content/policies/privacy/en.md` — Privacy policy
- `content/policies/gep/en.md` — Good Engineering Practices
- `ETHICAL_GOVERNANCE_IMPLEMENTATION.md` — Governance framework

**Standards:**

- Evidence-based claims only
- Cautious language (no overstatement)
- Front matter with review dates
- Status indicators (`in-progress`, `published`)
- Versioning with semantic versioning
- Multilingual consistency

**Review Cycle:** Every 3 months (as defined in front matter)

---

## Documentation Structure Standards

### Front Matter (Policy and Governance Docs)

All policy and governance documents must include front matter:

```yaml
---
title: 'Document Title'
summary: 'One-sentence description (150 chars max)'
status: 'draft' | 'in-progress' | 'published' | 'deprecated'
owner: 'Team Name <email@quantumpoly.ai>'
lastReviewed: 'YYYY-MM-DD'
nextReviewDue: 'YYYY-MM-DD'
version: 'vX.Y.Z'
---
```

**Status Definitions:**

- **draft:** Initial work, not for public consumption
- **in-progress:** Active development, may have placeholders
- **published:** Finalized, public-facing
- **deprecated:** Superseded by newer document

**Versioning:**

- Semantic versioning: `MAJOR.MINOR.PATCH`
- Major: Breaking changes or significant rewrites
- Minor: New sections or substantial additions
- Patch: Typos, clarifications, minor updates

### File Naming Conventions

| Type                     | Convention                        | Example                                    |
| ------------------------ | --------------------------------- | ------------------------------------------ |
| Onboarding               | `UPPERCASE.md`                    | `ONBOARDING.md`                            |
| Technical guides         | `SCREAMING_SNAKE_CASE.md`         | `ACCESSIBILITY_TESTING.md`                 |
| Strategic docs           | `SCREAMING_SNAKE_CASE.md`         | `STRATEGIC_ROADMAP.md`                     |
| Process docs             | `UPPERCASE.md`                    | `CONTRIBUTING.md`                          |
| Implementation summaries | `BLOCKN_DESCRIPTION.md`           | `BLOCK07.0_CICD_IMPLEMENTATION_SUMMARY.md` |
| Governance docs          | Front matter + kebab-case folders | `content/policies/ethics/en.md`            |

### Heading Hierarchy

**Strict Hierarchy:**

```markdown
# Document Title (H1) — Only one per document

## Major Section (H2)

### Subsection (H3)

#### Detail (H4)

##### Sub-detail (H5) — Rarely used

###### Micro-detail (H6) — Avoid if possible
```

**Best Practices:**

- Don't skip levels (e.g., H1 → H3)
- Keep hierarchy shallow (max 3-4 levels)
- Use descriptive headings (not "Introduction" or "Section 1")
- Ensure headings are unique (for anchor links)

### Table of Contents

**Required for documents >500 lines or >10 major sections.**

Format:

```markdown
## Table of Contents

1. [Section One](#section-one)
2. [Section Two](#section-two)
   - [Subsection A](#subsection-a)
   - [Subsection B](#subsection-b)
3. [Section Three](#section-three)
```

**Automatic Generation:**

Consider using tools like `markdown-toc` for long documents.

### Code Blocks

**Always specify language:**

`````markdown
````bash
npm install

```typescript
const foo = 'bar';

```json
{
  "key": "value"
}
````
`````

`````

**Inline code:**

Use backticks for code, commands, file paths, and technical terms:

- Run `npm install` to install dependencies.
- Edit `src/app/layout.tsx` for layout changes.
- The `useState` hook manages component state.

### Links

**Internal Links (within project):**

- Use relative paths: `[ONBOARDING.md](../ONBOARDING.md)`
- Use anchor links for sections: `[Getting Started](#getting-started)`

**External Links:**

- Always use HTTPS
- Include descriptive text (not "click here")
- Consider link rot (document context if link is critical)

**Examples:**

✅ **Good:** See the [Next.js Documentation](https://nextjs.org/docs) for details.

❌ **Bad:** Click [here](https://nextjs.org/docs).

### Tables

**Use for structured data:**

```markdown
| Column 1    | Column 2  | Column 3    |
| ----------- | --------- | ----------- |
| Data        | More data | Even more   |
| Another row | Values    | Information |
```

**Best Practices:**

- Keep tables simple (max 5-6 columns)
- Use left-alignment for text, right for numbers
- Include header row
- Consider lists for < 3 columns

### Lists

**Unordered Lists:**

Use for non-sequential items:

```markdown
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three
```

**Ordered Lists:**

Use for sequential steps or priorities:

```markdown
1. First step
2. Second step
3. Third step
```

**Checklist (Task Lists):**

Use for actionable items:

```markdown
- [ ] Task not completed
- [x] Task completed
- [ ] Another pending task
```

### Admonitions and Callouts

**Use for important information:**

```markdown
**Note:** Regular informational note.

**Important:** Emphasizes critical information.

**Warning:** Alerts about potential issues.

**Caution:** Warns about actions with consequences.

**Tip:** Provides helpful suggestions.
```

**Visual Formatting:**

Use bold for label, regular text for content:

```markdown
**Note:** This is a note with some important information.
```

---

## Writing Style Guide

### Tone and Voice

**Formal Yet Accessible:**

- Technical precision without jargon overload
- Professional but not bureaucratic
- Respectful and inclusive

**Examples:**

✅ **Good:** "We recommend using TypeScript for type safety and improved developer experience."

❌ **Too Casual:** "TypeScript is super cool and you should totally use it!"

❌ **Too Formal:** "It is hereby recommended that contributors utilize TypeScript as the preferred programming language for the purposes of type safety."

### Tense and Perspective

**Imperative for Instructions:**

- "Run `npm install`" (not "You should run...")
- "Add the following code" (not "The following code should be added")

**Present Tense for Descriptions:**

- "The system validates input" (not "The system will validate")
- "TypeScript ensures type safety" (not "TypeScript will ensure")

**Second Person for Addressing Reader:**

- "You can configure..." (acceptable)
- "We recommend..." (acceptable for guidance)
- Avoid first-person singular ("I think...")

### Inclusive Language

**Gender-Neutral Pronouns:**

Use "they/them" instead of "he/she":

✅ **Good:** "When a contributor submits a PR, they should include tests."

❌ **Bad:** "When a contributor submits a PR, he should include tests."

**Ability-Inclusive:**

- "Use the keyboard" (not "simply press")
- "See the example" (not "obviously, you can see")
- Avoid ableist terms ("sanity check" → "verification", "blind review" → "anonymous review")

**Cultural Sensitivity:**

- Avoid idioms that don't translate well
- Use simple, direct language
- Explain acronyms on first use

### Acronyms and Abbreviations

**On First Use:**

Spell out with acronym in parentheses:

- "Web Content Accessibility Guidelines (WCAG)"
- "Continuous Integration/Continuous Deployment (CI/CD)"

**Exceptions:**

Common tech terms don't need spelling out:

- HTML, CSS, API, URL
- npm, Git, JSON

### Numbers and Dates

**Numbers:**

- Use numerals for technical values: "Node 20.x", "85% coverage"
- Spell out numbers at start of sentence: "Twenty tests were added."

**Dates:**

- ISO 8601 format: `YYYY-MM-DD` (e.g., `2025-10-25`)
- Avoid ambiguous formats: Not "10/25/2025" or "25/10/2025"

### Commands and Code

**Commands:**

Always provide full commands with context:

```markdown
# Install dependencies

npm ci

# Run tests

npm run test
```

**Code Examples:**

- Include necessary imports
- Show realistic, working examples
- Comment complex logic
- Indicate expected output

---

## When to Update Documentation

### Mandatory Updates

**Documentation MUST be updated when:**

1. **Code Changes Behavior:**
   - New features added
   - API interfaces modified
   - Configuration options changed
   - Commands or scripts altered

2. **Process Changes:**
   - Contribution workflow modified
   - Review criteria updated
   - CI/CD pipelines changed
   - Governance procedures revised

3. **Architectural Decisions:**
   - Major refactors completed
   - Technology choices changed
   - Design patterns adopted
   - Performance strategies shifted

4. **Policy Changes:**
   - Ethical commitments updated
   - Privacy practices changed
   - Accessibility standards raised
   - Compliance requirements introduced

### Optional Updates

**Documentation SHOULD be updated when:**

- Clarifications needed based on user feedback
- Examples can be improved
- Troubleshooting sections expanded
- Cross-references enhanced

---

## Documentation Review Process

### Peer Review

**All documentation changes require peer review** (same as code):

1. Open Pull Request with doc changes
2. Request review from maintainer
3. Address feedback
4. Merge after approval

**Review Checklist for Documentation:**

- [ ] Accurate and up-to-date information
- [ ] Clear and concise writing
- [ ] Proper formatting (Markdown, headings, links)
- [ ] Spell-check and grammar-check
- [ ] Inclusive language
- [ ] Examples work as written
- [ ] Cross-references are valid

### Versioning Documentation

**Semantic Versioning for Major Docs:**

- `MAJOR`: Complete rewrite or structural change
- `MINOR`: New sections or significant additions
- `PATCH`: Typos, clarifications, minor fixes

**Example:**

- v1.0.0: Initial release
- v1.1.0: Added new section on testing
- v1.1.1: Fixed typos and clarified command examples
- v2.0.0: Complete rewrite with new structure

**Document Version in Front Matter or Footer:**

```markdown
**Document Version:** 1.0.0
**Last Updated:** 2025-10-25
```

---

## Archival Policy

### Deprecating Documentation

**When a document becomes outdated:**

1. **Mark as Deprecated:**
   - Update status in front matter: `status: 'deprecated'`
   - Add notice at top:
     ```markdown
     **⚠️ DEPRECATED:** This document has been superseded by [New Document](link).
     ```

2. **Link to Successor:**
   - Provide clear path to updated information
   - Explain what changed and why

3. **Retain for Historical Context:**
   - Do not delete (unless contains sensitive info)
   - Move to `docs/archive/` if needed
   - Maintain for audit trail

### Removing Documentation

**Documentation should ONLY be deleted when:**

- Contains sensitive or private information
- Contains factually incorrect information (correct instead if possible)
- Duplicates other documentation completely
- Legal or compliance reasons require removal

**Process:**

1. Open issue explaining removal rationale
2. Get approval from maintainers
3. Document removal in CHANGELOG or commit message
4. Archive copy in private repository (if needed for reference)

---

## Feedback Mechanism

### How Users Can Provide Feedback

**GitHub Issues:**

- Open issue with label `documentation`
- Describe what's unclear or missing
- Suggest improvements

**Pull Requests:**

- Propose specific changes directly
- Small fixes (typos, links) welcome without prior issue

**Email:**

- For sensitive feedback: documentation@quantumpoly.ai

### Addressing Feedback

**Response Time:**

- GitHub issues: 2-3 business days for acknowledgment
- PRs: Review within 1 week
- Email: Within 2 weeks

**Resolution:**

- Accept: Merge PR or implement suggestion
- Clarify: Engage in discussion to understand need
- Defer: Add to backlog if lower priority
- Decline: Explain rationale if suggestion doesn't align with standards

---

## Documentation Maintenance Schedule

### Regular Reviews

| Documentation Type    | Review Frequency | Trigger                         |
| --------------------- | ---------------- | ------------------------------- |
| Onboarding            | Quarterly        | Onboarding process changes      |
| Technical Reference   | As needed        | Related code/tool updates       |
| Strategic             | Quarterly        | Major milestones or pivots      |
| Process               | Semi-annually    | Retrospectives, process changes |
| Governance (Policies) | Every 3 months   | Defined in front matter         |

### Audit Checklist

**Quarterly Documentation Audit:**

- [ ] All links functional (no 404s)
- [ ] Commands and examples work with latest versions
- [ ] Cross-references valid
- [ ] Outdated content identified for update or deprecation
- [ ] Feedback from users incorporated
- [ ] Versioning up-to-date
- [ ] Review dates updated in front matter

---

## Tools and Automation

### Markdown Linting

**Use `markdownlint` for consistency:**

```bash
# Install
npm install --save-dev markdownlint-cli

# Run
npx markdownlint '**/*.md' --ignore node_modules
```

**Configuration:** `.markdownlint.json` (customize as needed)

### Link Checking

**Use `markdown-link-check` to find broken links:**

```bash
# Install
npm install --save-dev markdown-link-check

# Run
npx markdown-link-check README.md
```

**CI Integration:** Consider adding to GitHub Actions for automated checks.

### Spell Checking

**Use IDE spell checkers:**

- VS Code: `Code Spell Checker` extension
- Configure to recognize technical terms

**Manual Review:** Always read documentation aloud or have peer review.

### Table of Contents Generation

**For long documents, automate TOC:**

```bash
# Install
npm install --save-dev markdown-toc

# Generate
npx markdown-toc -i DOCUMENT.md
```

---

## Examples and Templates

### Example: Technical Guide Structure

````markdown
# Guide Title

**Brief Description**

**Document Version:** 1.0.0
**Last Updated:** YYYY-MM-DD
**Estimated Reading Time:** X minutes

---

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Instructions](#step-by-step-instructions)
4. [Troubleshooting](#troubleshooting)
5. [Further Reading](#further-reading)

---

## Introduction

Brief overview of what this guide covers and why it matters.

## Prerequisites

- Requirement 1
- Requirement 2

## Step-by-Step Instructions

### Step 1: Do This

```bash
command here

**Expected Output:**
```
`````

output here

### Step 2: Do That

...

## Troubleshooting

**Issue:** Description of issue

**Solution:** How to resolve

## Further Reading

- [Related Doc 1](link)
- [Related Doc 2](link)

---

**Document Version:** 1.0.0  
**Feedback:** Open GitHub issue with label `documentation`

````

### Example: Policy Document Structure

```markdown
---
title: 'Policy Title'
summary: 'Brief summary'
status: 'in-progress'
owner: 'Team <email@quantumpoly.ai>'
lastReviewed: 'YYYY-MM-DD'
nextReviewDue: 'YYYY-MM-DD'
version: 'v0.1.0'
---

## Introduction

Purpose and scope of policy.

## Core Principles

### Principle 1

Description and commitments.

### Principle 2

Description and commitments.

## Implementation

How principles are put into practice.

## Review and Updates

How and when this policy is reviewed.

## Contact

For questions: email@quantumpoly.ai
````

---

## Conclusion

Documentation is **living infrastructure** that supports the project's growth, transparency, and accessibility. By adhering to these standards, we ensure that QuantumPoly remains understandable, maintainable, and welcoming to all contributors.

**Remember:**

- Documentation is never finished—it evolves with the system
- Clarity and accuracy over brevity
- Inclusive language is non-negotiable
- User feedback shapes continuous improvement

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Review Cycle:** Quarterly  
**Feedback:** Open GitHub issue with label `documentation` or `meta`  
**Maintainer:** Documentation Team <docs@quantumpoly.ai>
