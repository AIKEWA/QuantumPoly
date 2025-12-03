# Contributor Personas

**Role-Specific Onboarding Paths for QuantumPoly Contributors**

This guide maps different contributor types to their specific responsibilities, required skills, and onboarding paths. Use this to understand where you fit and how you can contribute most effectively.

**Version:** 1.0.0  
**Last Updated:** 2025-10-25

---

## Table of Contents

1. [Overview](#overview)
2. [Persona 1: Frontend Developer](#persona-1-frontend-developer)
3. [Persona 2: Backend/API Developer](#persona-2-backendapi-developer)
4. [Persona 3: Accessibility Specialist](#persona-3-accessibility-specialist)
5. [Persona 4: Content Writer/Editor](#persona-4-content-writereditor)
6. [Persona 5: Translator/Localization Expert](#persona-5-translatorlocalization-expert)
7. [Persona 6: Governance/Ethics Reviewer](#persona-6-governanceethics-reviewer)
8. [Persona 7: Designer (UI/UX)](#persona-7-designer-uiux)
9. [Persona 8: DevOps/Infrastructure](#persona-8-devopsinfrastructure)
10. [Persona 9: QA/Testing Specialist](#persona-9-qatesting-specialist)
11. [Cross-Functional Collaboration](#cross-functional-collaboration)

---

## Overview

### How to Use This Guide

1. **Identify Your Primary Persona:** Find the role that best matches your skills and interests
2. **Follow the Onboarding Path:** Complete the recommended steps in order
3. **Explore Cross-Functional Areas:** Consider expanding into related areas
4. **Reach Out:** Contact the team lead for your persona area

### Skill Level Indicators

- 🌱 **Beginner:** Learning fundamentals, needs guidance
- 🌿 **Intermediate:** Comfortable with basics, can work independently
- 🌳 **Advanced:** Expert level, can mentor others

---

## Persona 1: Frontend Developer

### Description

You build and maintain user-facing components, pages, and interactions using React, TypeScript, and Tailwind CSS.

### Required Skills

- 🌿 **React** (hooks, components, state management)
- 🌿 **TypeScript** (interfaces, generics, strict typing)
- 🌿 **Tailwind CSS** (utility-first styling)
- 🌱 **Next.js 14** (App Router, SSG, server components)
- 🌱 **Accessibility** (WCAG basics, semantic HTML)

### Responsibilities

- Implement UI components from designs
- Ensure WCAG 2.2 AA compliance
- Write unit tests for components
- Maintain responsive design across devices
- Optimize for performance (bundle size, Core Web Vitals)

### Onboarding Path

**Day 1-2: Setup & Exploration**

1. Complete [DEVELOPER_QUICKSTART.md](./DEVELOPER_QUICKSTART.md)
2. Study existing components:
   - `src/components/Hero.tsx` — Well-documented example
   - `src/components/Footer.tsx` — Complex component with i18n
3. Run Storybook: `npm run storybook`

**Day 3-5: First Contribution**

4. Pick a `good-first-issue` labeled `ui` or `component`
5. Create a branch: `feat/component-name`
6. Implement component with tests
7. Verify accessibility: `npm run test:a11y`
8. Open PR

**Week 2: Deeper Dive**

9. Study [I18N_GUIDE.md](../I18N_GUIDE.md) for internationalization
10. Review [ACCESSIBILITY_TESTING.md](../ACCESSIBILITY_TESTING.md)
11. Pick medium complexity issue

### Tools and Resources

- **IDE:** VS Code with Tailwind IntelliSense
- **Browser DevTools:** React DevTools, Lighthouse
- **Testing:** Jest, Testing Library, axe DevTools
- **Documentation:** [Next.js Docs](https://nextjs.org/docs), [React Docs](https://react.dev/)

### Team Contact

- **Lead:** engineering@quantumpoly.ai
- **Channel:** GitHub issues with `ui` or `component` labels

---

## Persona 2: Backend/API Developer

### Description

You build and maintain API routes, server-side logic, data validation, and integrations.

### Required Skills

- 🌿 **TypeScript/JavaScript** (Node.js environment)
- 🌿 **API Design** (REST, validation, error handling)
- 🌱 **Next.js API Routes** (App Router API routes)
- 🌱 **Zod** (Schema validation)
- 🌱 **Rate Limiting** (Abuse prevention)

### Responsibilities

- Implement API endpoints
- Validate and sanitize inputs
- Handle errors gracefully
- Implement rate limiting and security measures
- Write integration tests

### Onboarding Path

**Day 1-2: Setup & Exploration**

1. Complete [DEVELOPER_QUICKSTART.md](./DEVELOPER_QUICKSTART.md)
2. Study Newsletter API:
   - `src/app/api/newsletter/route.ts` — Example API
   - `__tests__/api/newsletter.route.test.ts` — Testing patterns
3. Read [NEWSLETTER_API.md](../NEWSLETTER_API.md)

**Day 3-5: First Contribution**

4. Pick issue labeled `api` or `backend`
5. Implement endpoint with validation
6. Write integration tests
7. Test rate limiting manually
8. Open PR

**Week 2: Deeper Dive**

9. Review error handling patterns
10. Study rate limiting implementation
11. Explore Supabase integration (if applicable)

### Tools and Resources

- **Testing:** Supertest, Jest, Postman/Insomnia
- **Validation:** Zod schemas
- **Documentation:** [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### Team Contact

- **Lead:** engineering@quantumpoly.ai
- **Channel:** GitHub issues with `api` or `backend` labels

---

## Persona 3: Accessibility Specialist

### Description

You ensure the project meets WCAG 2.2 AA standards and is usable by people with diverse abilities.

### Required Skills

- 🌳 **WCAG 2.2** (Success criteria, testing methods)
- 🌿 **Assistive Technologies** (Screen readers, keyboard navigation)
- 🌿 **HTML/ARIA** (Semantic HTML, ARIA roles and properties)
- 🌱 **Axe DevTools** (Automated testing)
- 🌱 **Manual Testing** (Keyboard, screen reader)

### Responsibilities

- Conduct accessibility audits
- Review PRs for accessibility issues
- Suggest ARIA improvements
- Test with screen readers (NVDA, VoiceOver, JAWS)
- Educate team on accessibility best practices

### Onboarding Path

**Day 1-2: Project Understanding**

1. Read [ONBOARDING.md](../../ONBOARDING.md) — Focus on accessibility sections
2. Review [ACCESSIBILITY_TESTING.md](../ACCESSIBILITY_TESTING.md)
3. Run accessibility tests:
   ```bash
   npm run test:a11y
   npm run test:e2e:a11y
   npm run lh:a11y
   ```

**Day 3-5: Initial Audit**

4. Conduct manual audit of home page:
   - Keyboard navigation
   - Screen reader testing (VoiceOver or NVDA)
   - Color contrast checks
5. Document findings in GitHub issue

**Week 2: Deep Dive**

6. Audit policy pages (`/ethics`, `/privacy`, `/gep`, `/imprint`)
7. Review existing components for ARIA usage
8. Open PRs to fix identified issues

### Tools and Resources

- **Browser Extensions:** axe DevTools, WAVE
- **Screen Readers:** NVDA (Windows), VoiceOver (Mac), JAWS
- **Testing:** Playwright with axe-core
- **Reference:** [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)

### Team Contact

- **Lead:** trust@quantumpoly.ai (accessibility falls under ethical commitments)
- **Channel:** GitHub issues with `a11y` label

---

## Persona 4: Content Writer/Editor

### Description

You create, edit, and improve written content including documentation, blog posts (future), and policy pages.

### Required Skills

- 🌿 **Technical Writing** (Clear, concise, accurate)
- 🌿 **Markdown** (Formatting, structure)
- 🌱 **Inclusive Language** (Gender-neutral, ability-inclusive)
- 🌱 **SEO Basics** (Headings, keywords, meta descriptions)
- 🌱 **Git/GitHub** (Branching, PRs, basic workflows)

### Responsibilities

- Write and update documentation
- Edit policy pages for clarity and accuracy
- Ensure inclusive and accessible language
- Create tutorials and guides (future blog)
- Review content PRs

### Onboarding Path

**Day 1-2: Content Review**

1. Read [ONBOARDING.md](../../ONBOARDING.md) for project context
2. Review existing documentation:
   - `README.md`
   - `content/policies/ethics/en.md`
   - `docs/I18N_GUIDE.md`
3. Note areas for improvement

**Day 3-5: First Contribution**

4. Pick issue labeled `documentation`
5. Make edits (typos, clarity, examples)
6. Open PR with clear explanation
7. Respond to review feedback

**Week 2: Deeper Involvement**

8. Read [DOCUMENTATION_STANDARDS.md](../DOCUMENTATION_STANDARDS.md)
9. Review [ETHICAL_REVIEWER_GUIDE.md](./ETHICAL_REVIEWER_GUIDE.md)
10. Propose new documentation or major improvements

### Tools and Resources

- **Editor:** VS Code with Markdown extensions, Grammarly
- **Style Guide:** [DOCUMENTATION_STANDARDS.md](../DOCUMENTATION_STANDARDS.md)
- **Reference:** [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/)

### Team Contact

- **Lead:** documentation@quantumpoly.ai
- **Channel:** GitHub issues with `documentation` label

---

## Persona 5: Translator/Localization Expert

### Description

You translate content into new languages or improve existing translations, ensuring cultural appropriateness and linguistic accuracy.

### Required Skills

- 🌳 **Native/Fluent** in target language
- 🌿 **Translation** (Technical, marketing, legal)
- 🌱 **Cultural Sensitivity** (Localization, not just translation)
- 🌱 **JSON** (Editing translation files)
- 🌱 **Git/GitHub** (Branching, PRs)

### Responsibilities

- Translate UI strings and content
- Review and improve existing translations
- Ensure cultural appropriateness
- Maintain consistency in terminology
- Flag untranslatable or culturally problematic content

### Onboarding Path

**Day 1-2: Localization System**

1. Read [I18N_GUIDE.md](../I18N_GUIDE.md)
2. Explore translation files:
   ```
   src/locales/[locale]/
   ├── hero.json
   ├── about.json
   └── ...
   ```
3. Understand namespace structure

**Day 3-5: First Translation**

4. Pick target locale (existing or new)
5. Review English source (`src/locales/en/`)
6. Translate one namespace
7. Test locally: `http://localhost:3000/[locale]`
8. Open PR

**Week 2: Quality Assurance**

9. Review other translations in your language
10. Check for consistency and accuracy
11. Suggest improvements to unclear source text

### Tools and Resources

- **Reference:** [I18N_GUIDE.md](../I18N_GUIDE.md)
- **Validation:** `npm run validate:translations`
- **Testing:** `npm run test:e2e:i18n`

### Team Contact

- **Lead:** engineering@quantumpoly.ai (i18n technical), content for linguistic questions
- **Channel:** GitHub issues with `i18n` or `translation` labels

---

## Persona 6: Governance/Ethics Reviewer

### Description

You review policy pages, ethical communications, and governance processes to ensure transparency, accuracy, and responsible language.

### Required Skills

- 🌿 **AI Ethics** (Principles, frameworks, responsible AI)
- 🌿 **Critical Analysis** (Identifying unsupported claims, evaluating evidence)
- 🌱 **Policy Writing** (Clear, measured language)
- 🌱 **Git/GitHub** (Reviewing PRs, commenting)

### Responsibilities

- Review policy page changes
- Flag unsupported or overstated claims
- Suggest evidence-based framing
- Ensure transparency commitments are met
- Participate in governance discussions

### Onboarding Path

**Day 1-2: Governance Framework**

1. Read [ETHICAL_GOVERNANCE_IMPLEMENTATION.md](../../ETHICAL_GOVERNANCE_IMPLEMENTATION.md)
2. Review [ETHICAL_REVIEWER_GUIDE.md](./ETHICAL_REVIEWER_GUIDE.md)
3. Study policy pages:
   - `content/policies/ethics/en.md`
   - `content/policies/privacy/en.md`

**Day 3-5: Practice Review**

4. Complete sample review exercise in [ETHICAL_REVIEWER_GUIDE.md](./ETHICAL_REVIEWER_GUIDE.md#training-and-practice)
5. Review open PRs affecting policy pages
6. Provide feedback using review template

**Week 2: Active Review**

7. Monitor PRs with `governance` or `ethics` labels
8. Participate in governance discussions
9. Propose improvements to governance processes

### Tools and Resources

- **Frameworks:** IEEE 7000, EU AI Act, Partnership on AI guidelines
- **Reference:** [ETHICS_COMMUNICATIONS_AUDIT.md](../ETHICS_COMMUNICATIONS_AUDIT.md)
- **Validation:** `npm run ethics:verify-ledger`

### Team Contact

- **Lead:** trust@quantumpoly.ai
- **Channel:** GitHub issues with `governance` or `ethics` labels

---

## Persona 7: Designer (UI/UX)

### Description

You create visual designs, improve user experience, and ensure design system consistency.

### Required Skills

- 🌿 **UI/UX Design** (Figma, Sketch, Adobe XD)
- 🌿 **Design Systems** (Components, patterns, tokens)
- 🌱 **Accessibility** (Contrast, sizing, focus states)
- 🌱 **Tailwind CSS** (Understanding utility-first approach)
- 🌱 **Responsive Design** (Mobile-first, breakpoints)

### Responsibilities

- Create mockups and prototypes
- Design new components and features
- Maintain design system consistency
- Ensure accessibility in designs (contrast, sizing)
- Collaborate with developers on implementation

### Onboarding Path

**Day 1-2: Design Audit**

1. Review existing UI:
   - Homepage (`http://localhost:3000/en`)
   - Policy pages
   - Components in Storybook (`npm run storybook`)
2. Note design patterns and inconsistencies

**Day 3-5: Design System Documentation**

3. Document current design system:
   - Colors (Tailwind palette)
   - Typography (font sizes, weights)
   - Spacing (padding, margins)
   - Components (buttons, cards, forms)
4. Identify gaps or improvement areas

**Week 2: Design Contribution**

5. Pick issue labeled `design` or `ui`
6. Create mockups in Figma/Sketch
7. Share with team for feedback
8. Work with developer to implement

### Tools and Resources

- **Design Tools:** Figma, Sketch, Adobe XD
- **Prototyping:** Figma, InVision
- **Reference:** [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- **Accessibility:** [Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Team Contact

- **Lead:** engineering@quantumpoly.ai (design-dev collaboration)
- **Channel:** GitHub issues with `design` or `ui` labels

---

## Persona 8: DevOps/Infrastructure

### Description

You maintain CI/CD pipelines, deployment infrastructure, and monitoring systems.

### Required Skills

- 🌿 **CI/CD** (GitHub Actions, workflows)
- 🌿 **Deployment** (Vercel, serverless)
- 🌱 **Monitoring** (Logging, alerting, performance)
- 🌱 **Security** (Secrets management, permissions)
- 🌱 **Scripting** (Bash, Node.js)

### Responsibilities

- Maintain GitHub Actions workflows
- Optimize CI/CD performance
- Implement monitoring and alerting
- Manage deployment environments
- Improve build and test infrastructure

### Onboarding Path

**Day 1-2: Pipeline Understanding**

1. Read [BLOCK07.0_CICD_IMPLEMENTATION_SUMMARY.md](../../BLOCK07.0_CICD_IMPLEMENTATION_SUMMARY.md)
2. Study workflows:
   - `.github/workflows/ci.yml`
   - `.github/workflows/release.yml`
   - `.github/workflows/preview.yml`
3. Understand deployment process

**Day 3-5: Pipeline Improvement**

4. Identify optimization opportunities
5. Propose improvements in GitHub issue
6. Implement approved changes
7. Test in feature branch

**Week 2: Advanced Topics**

8. Review governance integration (ledger updates)
9. Study GPG signing setup (if not yet implemented)
10. Propose monitoring improvements

### Tools and Resources

- **CI/CD:** GitHub Actions documentation
- **Deployment:** Vercel CLI, documentation
- **Monitoring:** Lighthouse CI, Vercel analytics
- **Reference:** [CI/CD Testing Guide](../CICD_TESTING_GUIDE.md)

### Team Contact

- **Lead:** engineering@quantumpoly.ai
- **Channel:** GitHub issues with `ci/cd` or `infrastructure` labels

---

## Persona 9: QA/Testing Specialist

### Description

You ensure code quality through comprehensive testing strategies, test case design, and bug identification.

### Required Skills

- 🌿 **Testing Strategies** (Unit, integration, E2E)
- 🌿 **Jest** (Unit testing framework)
- 🌱 **Playwright** (E2E testing)
- 🌱 **Test Case Design** (Edge cases, happy paths, negative tests)
- 🌱 **Bug Reporting** (Clear reproduction steps, screenshots)

### Responsibilities

- Write unit and integration tests
- Design E2E test scenarios
- Identify and report bugs
- Improve test coverage
- Review test quality in PRs

### Onboarding Path

**Day 1-2: Testing Infrastructure**

1. Review [ONBOARDING.md](../../ONBOARDING.md) — Testing Strategy section
2. Run existing tests:
   ```bash
   npm run test
   npm run test:a11y
   npm run test:e2e
   ```
3. Study test files:
   - `__tests__/Hero.test.tsx` — Unit test example
   - `e2e/i18n/language-switching.spec.ts` — E2E example

**Day 3-5: Test Coverage Improvement**

4. Generate coverage report: `npm run test:coverage`
5. Identify under-tested areas
6. Write tests for gaps
7. Open PR with new tests

**Week 2: E2E Scenarios**

8. Design new E2E test scenarios
9. Implement with Playwright
10. Integrate into CI pipeline

### Tools and Resources

- **Unit Testing:** Jest, Testing Library
- **E2E Testing:** Playwright
- **Coverage:** Istanbul (built into Jest)
- **Reference:** [Testing Library Docs](https://testing-library.com/)

### Team Contact

- **Lead:** engineering@quantumpoly.ai
- **Channel:** GitHub issues with `test` or `qa` labels

---

## Cross-Functional Collaboration

### Multi-Persona Features

Some features require collaboration across personas:

**Example: Blog Module (Future)**

| Persona                  | Contribution                          |
| ------------------------ | ------------------------------------- |
| Frontend Developer       | Implement blog components and layouts |
| Backend Developer        | Build RSS feed generation             |
| Content Writer           | Write initial blog posts              |
| Accessibility Specialist | Audit blog layout for WCAG compliance |
| Designer                 | Design blog post cards and layouts    |
| DevOps                   | Set up blog deployment pipeline       |
| QA Specialist            | Test blog functionality               |
| Governance Reviewer      | Review blog content guidelines        |

### Communication Channels

- **GitHub Issues:** Primary coordination (label issues with relevant personas)
- **Pull Requests:** Review and feedback (tag relevant reviewers)
- **Email:** engineering@quantumpoly.ai for general coordination

### Mentorship and Growth

**Looking to Expand Your Skills?**

- Pair with contributors from other personas
- Shadow code reviews in adjacent areas
- Propose cross-functional learning sessions

---

## Getting Started

### Choose Your Path

1. **Identify Your Primary Persona**
2. **Follow the Onboarding Path**
3. **Connect with Team Lead**
4. **Make Your First Contribution**

### Need Help?

- **General Questions:** contact@quantumpoly.ai
- **Technical Support:** engineering@quantumpoly.ai
- **Ethics/Governance:** trust@quantumpoly.ai
- **GitHub Discussions:** Ask questions publicly

---

## Conclusion

Every persona plays a vital role in making QuantumPoly a success. Whether you're writing code, content, or conducting reviews, your contributions matter.

**Welcome to the team!**

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Feedback:** Open GitHub issue with label `documentation` or `onboarding`
