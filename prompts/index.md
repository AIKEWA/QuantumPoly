# QuantumPoly Prompt Library Index

**Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintained By:** CASP Lead Architect

---

## Overview & Purpose

The QuantumPoly Prompt Library is a **searchable, semantically-organized collection** of prompts used to design, implement, and validate the governance-first CI/CD pipeline. Each prompt block combines:

- **Historical authenticity** - Actual prompts used in production implementation
- **Reusability** - Generalized templates for future projects
- **Integration guidance** - How prompts connect in chains
- **Validation evidence** - Test results and compliance metrics

**Target Audience:**

- DevOps engineers setting up CI/CD pipelines
- AI assistants (Cursor, GitHub Copilot) for automated workflows
- CASP contributors maintaining QuantumPoly
- Teams implementing governance-first architectures

---

## Quick Navigation

| Block    | Title                                                                      | Tags                                    | Dependencies |
| -------- | -------------------------------------------------------------------------- | --------------------------------------- | ------------ |
| **7.1**  | [CI/CD Architecture](#block-71--cicd-architecture--workflow-orchestration) | architecture, quality-gates, governance | None         |
| **7.2**  | [Testing Strategy](#block-72--cicd-testing-strategy--quality-gates)        | testing, accessibility, performance     | 7.1          |
| **7.3**  | [Deployment Flow](#block-73--cicd-deployment-flow--release-management)     | deployment, vercel, release-management  | 7.1, 7.2     |
| **7.7**  | [GPG Ledger Signing](#block-77--gpg-ledger-signing-optional)               | security, compliance, gpg-signing       | 7.1          |
| **B132** | [Ethics Singularity](#ethics-singularity-block-132)                        | ethics, meta-governance, singularity    | None         |
| **Util** | [Algorithm Design Advisor](#algorithm--logic-design)                       | algorithm, design, pseudocode           | None         |
| **Util** | [Data Trend Analyzer](#data-analysis--insights)                            | data-analysis, trends, insight          | None         |
| **Util** | [Visualization Architect](#data-analysis--insights)                        | visualization, design, charting         | None         |
| **Util** | [Translation Oracle](#language--communication)                             | translation, linguistics, culture       | None         |
| **Util** | [Executive Summary Composer](#language--communication)                     | summary, communication, executive       | None         |
| **Util** | [Brainstorming Catalyst](#strategy--innovation)                            | strategy, innovation, brainstorming     | None         |
| **Util** | [Ethical Assessment Engine](#governance--ethics)                           | ethics, policy, governance              | None         |

---

## By Category

### CI/CD Architecture

**Block 7.1 — CI/CD Architecture & Workflow Orchestration**

- **File:** [`07.1_cicd_architecture.md`](./07.1_cicd_architecture.md)
- **Purpose:** Design complete CI/CD pipeline with quality gates, deployment paths, and governance integration
- **Tags:** `ci-cd`, `architecture`, `nextjs`, `vercel`, `github-actions`, `governance`
- **Key Decisions:** Consolidated workflows, Vercel CLI, tiered artifact retention
- **Output:** `.github/workflows/ci.yml`, `.github/workflows/release.yml`, documentation suite

### Testing & Quality Assurance

**Block 7.2 — CI/CD Testing Strategy & Quality Gates**

- **File:** [`07.2_cicd_testing.md`](./07.2_cicd_testing.md)
- **Purpose:** Implement multi-layer testing (quality, accessibility, performance, E2E)
- **Tags:** `testing`, `quality-gates`, `accessibility`, `performance`, `e2e`
- **Key Decisions:** Jest vs Vitest, Playwright vs Cypress, coverage enforcement
- **Output:** Test configurations, quality jobs, accessibility validation

### Deployment & Release Management

**Block 7.3 — CI/CD Deployment Flow & Release Management**

- **File:** [`07.3_cicd_deployment.md`](./07.3_cicd_deployment.md)
- **Purpose:** Implement deployment workflows with preview, staging, production paths
- **Tags:** `deployment`, `vercel`, `release-management`, `staging`, `production`
- **Key Decisions:** Manual approval gates, domain aliasing, rollback procedures
- **Output:** Deployment workflows, DNS configuration, rollback procedures

### Security & Compliance

**Block 7.7 — GPG Ledger Signing (Optional)**

- **File:** [Referenced in main docs](../docs/CICD_GPG_LEDGER_INTEGRATION.md)
- **Purpose:** Add cryptographic signatures to governance ledger for compliance
- **Tags:** `security`, `compliance`, `gpg-signing`, `audit-trail`
- **Key Decisions:** Optional enhancement for regulated industries
- **Output:** GPG setup guide, verification procedures, compliance use cases

### Algorithm & Logic Design

**Algorithm Design Advisor (Professor Prompto)**

- **File:** [`algorithm_design_advisor.md`](./algorithm_design_advisor.md)
- **Purpose:** Design efficient algorithms, explain logic, and analyze complexity
- **Tags:** `algorithm`, `design`, `pseudocode`, `complexity`, `optimization`
- **Key Decisions:** Persona-based interaction, rigorous complexity analysis
- **Output:** Algorithm design, pseudocode, complexity analysis

### Data Analysis & Insights

**Data Trend Analyzer (Professor Prompto)**

- **File:** [`data_trend_analyzer.md`](./data_trend_analyzer.md)
- **Purpose:** Transform dataset summaries into concise, non-technical trend analyses
- **Tags:** `data-analysis`, `trend-analysis`, `insight`, `reporting`
- **Key Decisions:** Persona-based interaction, focus on non-technical clarity
- **Output:** Trends, outliers, causes, and recommendations

**Visualization Strategy Architect (Professor Prompto)**

- **File:** [`visualization_strategy_architect.md`](./visualization_strategy_architect.md)
- **Purpose:** Recommend effective visualizations and tools for datasets
- **Tags:** `visualization`, `chart-selection`, `design`, `communication`
- **Key Decisions:** Cognitive load theory application, tool-agnostic advice
- **Output:** Chart types, justifications, and library recommendations

### Strategy & Innovation

**Brainstorming Catalyst**

- **File:** [`brainstorming_catalyst.md`](./brainstorming_catalyst.md)
- **Purpose:** Generate high-quality ideas for strategy, marketing, and R&D
- **Tags:** `strategy`, `innovation`, `brainstorming`, `ideation`
- **Key Decisions:** Structured output format, focus on rationale and impact
- **Output:** List of 2-3 sentence ideas with summary, rationale, and impact

### Governance & Ethics

**B132 — Ethics Singularity (Block 13.2)**

- **B132-OVERVIEW**: [`B132-OVERVIEW_ethics-singularity-theoretical-overview.md`](./B132-OVERVIEW_ethics-singularity-theoretical-overview.md) - Theoretical synthesis
- **B132-ESSAY**: [`B132-ESSAY_ethics-singularity-paper-draft-generator.md`](./B132-ESSAY_ethics-singularity-paper-draft-generator.md) - Academic paper generation
- **B132-SIM**: [`B132-SIM_ethics-singularity-simulation-designer.md`](./B132-SIM_ethics-singularity-simulation-designer.md) - Simulation design
- **B132-SYMPOSIUM**: [`B132-SYMPOSIUM_ethics-singularity-symposium-designer.md`](./B132-SYMPOSIUM_ethics-singularity-symposium-designer.md) - Symposium organization
- **B132-FRAMEWORK**: [`B132-FRAMEWORK_ethics-singularity-framework-doc.md`](./B132-FRAMEWORK_ethics-singularity-framework-doc.md) - Framework documentation

**Ethical–Policy Assessment Engine (Professor Prompto)**

- **File:** [`ethical_policy_assessment_engine.md`](./ethical_policy_assessment_engine.md)
- **Purpose:** Evaluate policies/proposals for ethical, social, and environmental implications
- **Tags:** `ethics`, `policy`, `governance`, `assessment`
- **Key Decisions:** Persona-based interaction, comprehensive risk analysis
- **Output:** Ethical analysis, risks & vulnerabilities, recommendations

### Language & Communication

**Multilingual Translation Oracle (Professor Prompto)**

- **File:** [`multilingual_translation_oracle.md`](./multilingual_translation_oracle.md)
- **Purpose:** Provide tone-aligned, culturally nuanced translations
- **Tags:** `translation`, `linguistics`, `culture`, `tone`
- **Key Decisions:** Persona-based interaction, focus on tone preservation and cultural adaptation
- **Output:** Translated text, tone notes, cultural adaptation notes

**Executive Summary Composer**

- **File:** [`executive_summary_composer.md`](./executive_summary_composer.md)
- **Purpose:** Distill long reports into concise, actionable executive briefs
- **Tags:** `summary`, `communication`, `executive`, `reporting`
- **Key Decisions:** Strict 250-word limit, focus on outcomes/actions
- **Output:** Executive summary, key insights, next steps

---

## By Use Case

### "I want to set up CI/CD from scratch"

**Recommended Path:**

```
1. Block 7.1 (Architecture)
   → Design overall pipeline structure
   → Define quality gates and deployment paths

2. Block 7.2 (Testing)
   → Configure testing tools (Jest, Playwright, Lighthouse)
   → Set up quality gates and coverage thresholds

3. Block 7.3 (Deployment)
   → Configure Vercel deployment workflows
   → Set up staging and production environments
   → Configure DNS and domain aliasing
```

**Templates Available:**

- [`quality_gates_template.md`](./templates/quality_gates_template.md)
- [`deployment_workflow_template.md`](./templates/deployment_workflow_template.md)

**Time Estimate:** 4-6 hours (with templates)

---

### "I want to add accessibility testing to my pipeline"

**Recommended Path:**

```
1. Block 7.2 (Testing) - Accessibility Section
   → Component-level: jest-axe setup
   → Page-level: Playwright + axe E2E tests
   → Audit-level: Lighthouse CI configuration
```

**Key Concepts:**

- Three-tier accessibility testing approach
- WCAG 2.2 AA compliance enforcement
- Fail-fast on accessibility violations

**Time Estimate:** 2-3 hours

---

### "I want to implement GPG ledger signing"

**Recommended Path:**

```
1. Block 7.7 (GPG Signing) + Block 7.3 (Deployment)
   → Generate GPG key pair
   → Configure GitHub Secrets
   → Integrate signature generation in ledger update
   → Set up verification procedures
```

**Prerequisites:**

- Production deployment workflow (Block 7.3)
- Governance ledger (Block 7.1)

**Time Estimate:** 1-2 hours

---

### "I need to troubleshoot deployment failures"

**Recommended Resources:**

```
1. Block 7.3 (Deployment) - Troubleshooting Section
   → Vercel token issues
   → Domain alias failures
   → Approval gate problems

2. Related Documentation
   → docs/CICD_TESTING_GUIDE.md - Troubleshooting Guide
   → docs/DNS_CONFIGURATION.md - DNS troubleshooting
```

**Common Issues:**

- Expired Vercel token → Regenerate in account settings
- Domain not aliasing → Verify DNS CNAME record
- Approval not triggering → Check GitHub Environment configuration

---

### "I want to optimize CI performance"

**Recommended Path:**

```
1. Block 7.1 (Architecture) - Performance Metrics Section
   → Workflow consolidation (60% time reduction)
   → npm caching (75% install time reduction)
   → Parallel job execution

2. Block 7.2 (Testing) - Parallelization Section
   → Jest parallel execution
   → Playwright worker configuration
```

**Key Optimizations:**

- Consolidate workflows to share dependency installation
- Enable npm caching with `actions/setup-node`
- Run independent jobs in parallel
- Use concurrency control to cancel superseded runs

---

## By Technology

### Next.js

**Relevant Blocks:**

- Block 7.1 (Architecture) - Next.js build configuration
- Block 7.2 (Testing) - Jest + next/testing-library setup
- Block 7.3 (Deployment) - Vercel deployment for Next.js

**Key Concepts:**

- Next.js 14.x compatibility
- Production build optimization
- Static export vs. server-side rendering

---

### TypeScript

**Relevant Blocks:**

- Block 7.1 (Architecture) - TypeScript strict mode in CI
- Block 7.2 (Testing) - TypeScript configuration for tests

**Key Concepts:**

- `tsc --noEmit` for type checking without build
- TypeScript coverage in Jest
- Strict mode enforcement

---

### Vercel

**Relevant Blocks:**

- Block 7.1 (Architecture) - Vercel as deployment target
- Block 7.3 (Deployment) - Vercel CLI usage, environment configuration

**Key Concepts:**

- Vercel CLI vs. vercel/action trade-offs
- Preview vs. production environments
- Custom domain configuration

---

### GitHub Actions

**Relevant Blocks:**

- Block 7.1 (Architecture) - Workflow structure, permissions, concurrency
- Block 7.2 (Testing) - Test execution in CI
- Block 7.3 (Deployment) - Deployment workflows, GitHub Environments

**Key Concepts:**

- Node 20.x LTS with npm caching
- Artifact upload and retention
- GitHub Environments for approval gates

---

### Playwright

**Relevant Blocks:**

- Block 7.2 (Testing) - E2E testing, accessibility testing with axe

**Key Concepts:**

- Multi-browser testing (Chromium, Firefox, WebKit)
- Axe-core integration for accessibility
- Parallel execution with workers

---

### Jest

**Relevant Blocks:**

- Block 7.2 (Testing) - Unit testing, coverage thresholds

**Key Concepts:**

- jest-axe for accessibility unit tests
- Coverage enforcement with `coverageThreshold`
- JUnit XML reporters for CI integration

---

## Prompt Chains

### Complete CI/CD Implementation Chain

```
7.1 (Architecture)
  ↓
  Defines: Overall pipeline structure, quality gates, deployment paths
  Outputs: ci.yml skeleton, release.yml skeleton, design decisions
  ↓
7.2 (Testing)
  ↓
  Depends on: Quality gate structure from 7.1
  Adds: Test configurations, tool selections, coverage thresholds
  Outputs: Complete quality jobs, test scripts, accessibility testing
  ↓
7.3 (Deployment)
  ↓
  Depends on: Architecture (7.1) + Testing (7.2)
  Adds: Deployment workflows, environment config, DNS setup
  Outputs: Complete deployment workflows, secrets configuration
  ↓
7.7 (GPG Signing) [Optional]
  ↓
  Depends on: Deployment (7.3) for ledger integration
  Adds: Cryptographic signatures for audit trail
  Outputs: GPG setup, signature verification, compliance documentation
```

### Testing-Focused Chain

```
7.2 (Testing) - Quality Gates
  ↓
  Lint + TypeCheck + Unit Tests
  ↓
7.2 (Testing) - Accessibility
  ↓
  jest-axe → Playwright axe → Lighthouse
  ↓
7.2 (Testing) - Performance
  ↓
  Bundle budgets → Lighthouse performance
  ↓
7.2 (Testing) - E2E
  ↓
  Playwright full test suite
```

### Deployment-Focused Chain

```
7.3 (Deployment) - Preview
  ↓
  PR opened → Preview deployment → URL commented
  ↓
7.3 (Deployment) - Staging
  ↓
  PR merged to main → Staging deployment → QA validation
  ↓
7.3 (Deployment) - Production
  ↓
  Tag created → Approval gate → Production deployment → Ledger update
```

---

## Tag Reference

### Primary Tags

| Tag               | Description                             | Blocks        |
| ----------------- | --------------------------------------- | ------------- |
| **ci-cd**         | General CI/CD concepts and workflows    | 7.1, 7.2, 7.3 |
| **architecture**  | System design and workflow structure    | 7.1           |
| **testing**       | Testing strategies and configurations   | 7.2           |
| **deployment**    | Deployment workflows and procedures     | 7.3           |
| **governance**    | Ethical governance and audit trails     | 7.1, 7.7      |
| **accessibility** | WCAG compliance and a11y testing        | 7.2           |
| **performance**   | Performance monitoring and budgets      | 7.2           |
| **security**      | Security best practices and GPG signing | 7.7           |
| **visualization** | Data visualization and chart selection  | Util          |
| **translation**   | Language translation and localization   | Util          |
| **culture**       | Cultural adaptation and nuance          | Util          |
| **strategy**      | Strategic planning and innovation       | Util          |
| **innovation**    | Idea generation and R&D                 | Util          |

### Technology Tags

| Tag                | Description                | Blocks        |
| ------------------ | -------------------------- | ------------- |
| **nextjs**         | Next.js framework          | 7.1, 7.2, 7.3 |
| **vercel**         | Vercel deployment platform | 7.1, 7.3      |
| **github-actions** | GitHub Actions workflows   | 7.1, 7.2, 7.3 |
| **typescript**     | TypeScript configurations  | 7.1, 7.2      |
| **jest**           | Jest testing framework     | 7.2           |
| **playwright**     | Playwright E2E testing     | 7.2           |
| **lighthouse**     | Lighthouse auditing        | 7.2           |

### Use Case Tags

| Tag                    | Description                       | Blocks        |
| ---------------------- | --------------------------------- | ------------- |
| **setup-from-scratch** | Complete CI/CD setup              | 7.1, 7.2, 7.3 |
| **quality-gates**      | Quality assurance gates           | 7.1, 7.2      |
| **release-management** | Release and deployment management | 7.3           |
| **compliance**         | Regulatory compliance features    | 7.7           |

---

## Search Keywords

### By Problem Domain

**Pipeline Performance:**

- Keywords: `cache`, `concurrency`, `parallel`, `optimization`, `speed`
- Relevant: Block 7.1 (consolidation), Block 7.2 (parallelization)

**Quality Assurance:**

- Keywords: `lint`, `typecheck`, `test`, `coverage`, `fail-fast`
- Relevant: Block 7.1 (gates), Block 7.2 (testing)

**Accessibility Compliance:**

- Keywords: `wcag`, `axe`, `a11y`, `lighthouse`, `accessibility`
- Relevant: Block 7.2 (accessibility testing)

**Performance Monitoring:**

- Keywords: `bundle`, `lighthouse`, `core-web-vitals`, `performance`
- Relevant: Block 7.2 (performance testing)

**Deployment Automation:**

- Keywords: `vercel`, `staging`, `production`, `preview`, `deployment`
- Relevant: Block 7.3 (deployment flow)

**Release Management:**

- Keywords: `approval`, `rollback`, `release`, `version`, `tag`
- Relevant: Block 7.3 (release management)

**Audit & Compliance:**

- Keywords: `ledger`, `gpg`, `audit-trail`, `compliance`, `governance`
- Relevant: Block 7.1 (ledger), Block 7.7 (GPG signing)

**Data Visualization:**

- Keywords: `chart`, `plot`, `graph`, `dashboard`, `visualization`
- Relevant: Visualization Strategy Architect

---

## Dependency Graph

```
┌──────────────────────────────────────────────────────────────┐
│  Block 7.1 — CI/CD Architecture (Foundation)                 │
│  • Workflow structure                                         │
│  • Quality gate definitions                                   │
│  • Deployment path design                                     │
│  • Governance integration                                     │
└────────────────────┬─────────────────────────────────────────┘
                     │
          ┌──────────┴───────────┐
          │                      │
          ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Block 7.2 — Testing │  │ Block 7.3 — Deploy  │
│ • Test configs      │  │ • Vercel workflows  │
│ • Quality jobs      │  │ • Environment setup │
│ • A11y & perf tests │  │ • DNS configuration │
└─────────────────────┘  └──────────┬──────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Block 7.7 — GPG Sign │
                         │ • Ledger signatures  │
                         │ • Compliance evidence│
                         │ (Optional)           │
                         └──────────────────────┘
```

---

## Template Library

The `/prompts/templates/` directory contains reusable, generalized templates for common CI/CD patterns:

### Quality Gates Template

**File:** [`templates/quality_gates_template.md`](./templates/quality_gates_template.md)

**Purpose:** Generic template for implementing quality gates (lint, typecheck, test)

**Customizable Variables:**

- `${PROJECT_NAME}` - Your project name
- `${TEST_COMMAND}` - Your test runner command
- `${COVERAGE_THRESHOLD}` - Your coverage threshold

### Deployment Workflow Template

**File:** [`templates/deployment_workflow_template.md`](./templates/deployment_workflow_template.md)

**Purpose:** Generic template for deployment workflows (staging, production)

**Customizable Variables:**

- `${DEPLOY_PLATFORM}` - Your deployment platform (Vercel, Netlify, AWS, etc.)
- `${DEPLOY_COMMAND}` - Platform-specific deployment command
- `${DOMAIN}` - Your production domain

### Governance Integration Template

**File:** [`templates/governance_integration_template.md`](./templates/governance_integration_template.md)

**Purpose:** Generic template for governance features (ledger, ethics validation)

**Customizable Variables:**

- `${LEDGER_PATH}` - Path to governance ledger directory
- `${VALIDATION_SCRIPTS}` - Your validation script commands

---

## Related Documentation

### QuantumPoly CI/CD Documentation

**Core Documentation:**

- [CI/CD Prompt Compliance Matrix](../docs/CICD_PROMPT_COMPLIANCE_MATRIX.md) - Requirements validation (100% compliance)
- [CI/CD Validation Scenarios](../docs/CICD_VALIDATION_SCENARIOS.md) - 22 test scenarios
- [CI/CD Testing Guide](../docs/CICD_TESTING_GUIDE.md) - Step-by-step testing procedures
- [CI/CD Implementation Summary](../docs/CICD_VALIDATION_IMPLEMENTATION_SUMMARY.md) - Complete overview

**Specialized Guides:**

- [GPG Ledger Integration](../docs/CICD_GPG_LEDGER_INTEGRATION.md) - Cryptographic signing (800+ lines)
- [DNS Configuration](../docs/DNS_CONFIGURATION.md) - Production domain setup
- [Simplified CI/CD Example](../docs/examples/SIMPLE_CICD_EXAMPLE.yml) - Educational reference

**Workflow Files:**

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) - Unified quality gates (with annotations)
- [`.github/workflows/release.yml`](../.github/workflows/release.yml) - Deployment workflows (with annotations)
- [`.github/CICD_REVIEW_CHECKLIST.md`](../.github/CICD_REVIEW_CHECKLIST.md) - Pre-deployment validation

---

## For Cursor AI & Automation

### Semantic Parsing Tags

For AI assistants to understand prompt relationships:

```yaml
# Block metadata structure
---
title: 'Prompt Block 7.X — Title'
version: 'v7.X.0'
tags: [category, subcategory, technology]
dependencies: ['07.Y_other_block.md']
technology: [Tool1, Tool2, Tool3]
use_cases: [use-case-1, use-case-2]
prompt_chain: '7.1 → 7.2 → 7.3 → 7.7'
---
```

### Recommended Cursor AI Workflow

```
1. Read: prompts/index.md (this file)
   → Understand available prompts and dependencies

2. Select: Choose block based on use case
   → Example: "setup CI/CD" → Blocks 7.1, 7.2, 7.3

3. Execute: Apply prompts in dependency order
   → 7.1 (Architecture) first
   → 7.2 (Testing) second
   → 7.3 (Deployment) third

4. Customize: Use templates for project-specific needs
   → Replace variables like ${PROJECT_NAME}

5. Validate: Cross-reference with compliance matrix
   → Ensure all requirements met
```

---

## Contribution Guidelines

### Adding New Prompt Blocks

**1. Create prompt block file:**

```markdown
---
title: 'Prompt Block 7.X — Title'
version: 'v7.X.0'
date: 'YYYY-MM-DD'
tags: [relevant, tags]
dependencies: ['prerequisite_blocks.md']
---

# Structure matches existing blocks (7.1, 7.2, 7.3)
```

**2. Update this index:**

- Add to "By Category" section
- Add to relevant "By Use Case" sections
- Update dependency graph
- Add new tags to "Tag Reference"

**3. Update cross-references:**

- Link from related blocks
- Update README.md if major addition
- Update compliance matrix if prompt-related

### Maintaining Existing Blocks

**Version Updates:**

- Increment version: `v7.X.Y` (Y = minor update)
- Update `date` field in frontmatter
- Document changes in block's changelog section

**Content Updates:**

- Keep "Historical authenticity" sections unchanged
- Update "Customization Guide" for new use cases
- Add new troubleshooting items as discovered

---

## Version History

| Version | Date       | Changes                                          | Author              |
| ------- | ---------- | ------------------------------------------------ | ------------------- |
| 1.0     | 2025-10-19 | Initial prompt library with blocks 7.1, 7.2, 7.3 | CASP Lead Architect |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  QuantumPoly Prompt Library - Quick Reference           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Setup from Scratch:  7.1 → 7.2 → 7.3                   │
│  Add Accessibility:   7.2 (Accessibility Section)       │
│  Add GPG Signing:     7.7 + 7.3 (Ledger Integration)    │
│  Troubleshoot Deploy: 7.3 (Troubleshooting Section)     │
│  Optimize Performance: 7.1 (Consolidation) + 7.2 (Parallel)│
│                                                          │
│  All prompts: Hybrid format (Markdown + frontmatter)    │
│  All blocks: Include real usage + generalized templates │
│  Dependencies: Follow prompt chain 7.1 → 7.2 → 7.3 → 7.7│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

**Index Version:** 1.2
**Last Updated:** 2025-12-02
**Total Prompts:** 3 core blocks + 1 optional + 5 utility + 5 ethics singularity + templates  
**Maintained By:** CASP Lead Architect
