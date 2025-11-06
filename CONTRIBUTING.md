# Contributing to QuantumPoly

**Thank you for your interest in contributing to QuantumPoly!**

We welcome contributions from developers, designers, content writers, accessibility experts, and governance reviewers. This document provides guidelines to ensure a smooth and productive collaboration.

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Types of Contributions](#types-of-contributions)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Review Process](#review-process)
9. [Recognition and Attribution](#recognition-and-attribution)
10. [Contact Information](#contact-information)

---

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we pledge to make participation in QuantumPoly a harassment-free experience for everyone, regardless of:

- Age
- Body size
- Disability
- Ethnicity
- Gender identity and expression
- Level of experience
- Education
- Socioeconomic status
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors include:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community and project
- Showing empathy towards other community members
- Providing clear, actionable, and respectful feedback

**Unacceptable behaviors include:**

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting
- Dismissing or attacking accessibility concerns or ethical considerations

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at trust@quantumpoly.ai. All complaints will be reviewed and investigated promptly and fairly.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that do not align with this Code of Conduct.

---

## Getting Started

### Prerequisites

Before contributing, please:

1. **Read the [ONBOARDING.md](./ONBOARDING.md)** — Governance-first onboarding guide covering:
   - Project maturity and limitations
   - Technical setup and dependencies
   - Ethical guidelines and review obligations
   - Known limitations and open research areas
   - Reference materials and source of truth
2. **Set up local development environment:**
   ```bash
   git clone https://github.com/AIKEWA/QuantumPoly.git
   cd QuantumPoly
   npm ci
   npm run dev
   ```
3. **Verify setup:**
   ```bash
   npm run lint      # Should pass
   npm run typecheck # Should pass
   npm run test      # Should pass
   ```

### Finding an Issue

**For First-Time Contributors:**

- Look for issues labeled `good-first-issue`
- Start with documentation improvements, test additions, or minor bug fixes
- Introduce yourself in the issue comments

**For Experienced Contributors:**

- Browse open issues labeled `help-wanted`, `enhancement`, or `bug`
- Check the [STRATEGIC_ROADMAP.md](./docs/STRATEGIC_ROADMAP.md) for future features
- Propose new features by opening an issue first (before implementation)

**Before Starting Work:**

- Comment on the issue to indicate you're working on it
- Wait for maintainer acknowledgment to avoid duplicate work
- Ask clarifying questions if requirements are unclear

---

## Types of Contributions

### 1. Code Contributions

**Areas:**

- New features (aligned with roadmap)
- Bug fixes
- Performance optimizations
- Accessibility improvements
- Test coverage enhancements

**Requirements:**

- TypeScript type safety
- WCAG 2.2 AA compliance
- Test coverage (85%+ for new code)
- Documentation updates
- No breaking changes without discussion

### 2. Documentation Contributions

**Areas:**

- README and onboarding improvements
- API documentation
- Tutorial creation
- Translation of documentation (future)
- Correcting typos, clarifying language

**Requirements:**

- Clear, concise writing
- Accurate technical information
- Inclusive language
- Examples and code snippets where helpful

### 3. Translation Contributions

**Areas:**

- Adding new locales (beyond current 6)
- Improving existing translations
- Correcting cultural or linguistic issues

**Requirements:**

- Native or fluent proficiency in target language
- Understanding of technical terminology
- Consistency with existing tone and style
- Validation of translation keys across all files

### 4. Design Contributions

**Areas:**

- UI/UX improvements
- Accessibility enhancements
- Visual design (icons, illustrations)
- Brand identity refinement

**Requirements:**

- Adherence to design system (Tailwind)
- Accessibility considerations (contrast, sizing)
- Responsive design across devices
- Feedback from accessibility reviewers

### 5. Accessibility Audits

**Areas:**

- Manual accessibility testing (keyboard, screen reader)
- Identifying WCAG violations
- Suggesting remediation strategies
- Improving ARIA usage

**Requirements:**

- Familiarity with WCAG 2.2 AA standards
- Experience with assistive technologies
- Clear documentation of findings
- Constructive remediation suggestions

### 6. Governance & Ethical Review

**Areas:**

- Policy page reviews
- Ethical impact assessments
- Language framing improvements
- Governance process refinement

**Requirements:**

- Understanding of AI ethics principles
- Attention to evidence-based claims
- Sensitivity to overstated language
- Alignment with transparency commitments

---

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork:
git clone https://github.com/YOUR_USERNAME/QuantumPoly.git
cd QuantumPoly

# Add upstream remote:
git remote add upstream https://github.com/AIKEWA/QuantumPoly.git
```

### 2. Create a Branch

**Branch Naming Convention:**

```
<type>/<description>

Types:
- feat/     # New features
- fix/      # Bug fixes
- docs/     # Documentation only
- refactor/ # Code refactoring (no behavior change)
- test/     # Test additions or fixes
- chore/    # Maintenance (deps, configs)
- a11y/     # Accessibility improvements
```

**Examples:**

```bash
git checkout -b feat/add-japanese-locale
git checkout -b fix/newsletter-validation
git checkout -b docs/update-contributing-guide
git checkout -b a11y/improve-keyboard-nav
```

### 3. Make Changes

**Best Practices:**

- Keep commits focused and atomic
- Write clear commit messages (see [Commit Guidelines](#commit-guidelines))
- Run tests frequently: `npm run test:watch`
- Check linting: `npm run lint`
- Verify types: `npm run typecheck`

**Before Committing:**

```bash
# Format code
npm run format:write

# Run all checks
npm run validate

# Run accessibility tests
npm run test:a11y
```

### 4. Sync with Upstream

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch on main
git rebase upstream/main

# Resolve conflicts if any
# Then: git rebase --continue
```

### 5. Push and Open PR

```bash
# Push to your fork
git push origin feat/add-japanese-locale

# Open Pull Request on GitHub
# - Use PR template (if available)
# - Reference related issues
# - Provide clear description
```

---

## Code Standards

### TypeScript

**Strict Type Safety:**

```typescript
// ✅ Good: Explicit types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  // Implementation
}

// ❌ Bad: Any types
function Button(props: any) {
  // Implementation
}
```

**Type Inference:**

Leverage TypeScript's inference where types are obvious:

```typescript
// ✅ Good: Inference is clear
const locale = 'en';
const count = posts.length;

// ❌ Unnecessary: Redundant type annotation
const locale: string = 'en';
```

### React Components

**Functional Components with TypeScript:**

```typescript
interface ComponentProps {
  title: string;
  description?: string;
  onAction?: () => void;
}

export function Component({ title, description, onAction }: ComponentProps) {
  // Implementation
  return <div>{title}</div>;
}
```

**Prop Destructuring:**

Always destructure props in function signature (not in body).

**Hooks:**

- Use `useState`, `useEffect`, `useMemo`, `useCallback` appropriately
- No unnecessary renders (use React DevTools Profiler)
- Custom hooks for reusable logic

### Accessibility

**Semantic HTML:**

```tsx
// ✅ Good: Semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ❌ Bad: Divs everywhere
<div className="nav">
  <div className="item">About</div>
</div>
```

**ARIA Usage:**

Use ARIA only when semantic HTML is insufficient:

```tsx
// ✅ Good: Semantic HTML first
<button onClick={handleClick}>Submit</button>

// ✅ Good: ARIA when necessary
<div role="alert" aria-live="polite">
  {errorMessage}
</div>

// ❌ Bad: Unnecessary ARIA
<button role="button" aria-label="Submit">Submit</button>
```

**Keyboard Navigation:**

- All interactive elements must be keyboard-accessible
- Visible focus indicators required
- Tab order should be logical
- No keyboard traps

### CSS (Tailwind)

**Utility-First Approach:**

```tsx
// ✅ Good: Tailwind utilities
<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
  <h2 className="text-xl font-bold mb-2">Title</h2>
</div>

// ❌ Bad: Inline styles
<div style={{ padding: '1rem', background: '#f3f4f6' }}>
  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Title</h2>
</div>
```

**Custom Colors:**

Avoid hard-coded colors—use Tailwind's palette:

```tsx
// ✅ Good: Tailwind colors
<div className="bg-blue-500 text-white">Content</div>

// ❌ Bad: Custom hex colors
<div className="bg-[#3b82f6] text-[#ffffff]">Content</div>
```

**Responsive Design:**

```tsx
// ✅ Good: Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Testing

**Test Structure:**

```typescript
describe('ComponentName', () => {
  it('renders with required props', () => {
    // Arrange
    const props = { title: 'Test' };
    
    // Act
    render(<ComponentName {...props} />);
    
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('has no accessibility violations', async () => {
    const { container } = render(<ComponentName title="Test" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Query Priority:**

1. `getByRole` — Preferred (accessibility-focused)
2. `getByLabelText` — Form elements
3. `getByText` — Non-interactive text
4. `getByTestId` — Last resort only

---

## Commit Guidelines

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                      |
|------------|--------------------------------------------------|
| `feat`     | New feature                                      |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation only changes                       |
| `style`    | Code style (formatting, no logic change)         |
| `refactor` | Code refactoring (no feature change or bug fix)  |
| `test`     | Adding or fixing tests                           |
| `chore`    | Maintenance tasks (deps, configs, tooling)       |
| `a11y`     | Accessibility improvements                       |
| `perf`     | Performance improvements                         |

### Scope (Optional)

Component or area affected:

- `i18n` — Internationalization
- `a11y` — Accessibility
- `api` — API routes
- `ui` — UI components
- `docs` — Documentation
- `ci` — CI/CD workflows
- `governance` — Governance and ethics

### Subject

- Use imperative mood: "add feature" not "added feature"
- Lowercase (no capitalization)
- No period at the end
- Max 72 characters

### Examples

```bash
feat(i18n): add Japanese locale support

fix(a11y): improve keyboard focus indicators in dark mode

docs: update contributing guidelines with commit examples

refactor(api): extract validation logic to shared utility

test: increase coverage for NewsletterForm component

chore(deps): update Next.js to 14.2.0

a11y(footer): add ARIA labels for social links
```

### Multi-Line Commits

For complex changes, use body and footer:

```
feat(blog): implement markdown blog post rendering

- Add markdown processing with remark/rehype
- Support syntax highlighting for code blocks
- Generate table of contents from headings
- Add reading time calculation

Closes #45
Related to #32
```

---

## Pull Request Process

### 1. Pre-Submission Checklist

Before opening a PR, verify:

- [ ] All tests pass (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Accessibility tests pass (`npm run test:a11y`)
- [ ] No new accessibility violations introduced
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow Conventional Commits
- [ ] Branch is up-to-date with `main`

### 2. PR Description Template

```markdown
## Description

Brief summary of changes.

## Related Issues

Closes #123
Related to #456

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update
- [ ] Accessibility improvement
- [ ] Performance optimization

## Testing

Describe how you tested the changes:
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed
- [ ] Accessibility testing (keyboard, screen reader)

## Screenshots (if applicable)

Add screenshots or screen recordings for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Accessibility verified
```

### 3. Draft PRs

For work-in-progress:

- Open as **Draft PR**
- Prefix title with `[WIP]` or `[Draft]`
- Use for early feedback or collaboration
- Convert to ready when complete

### 4. PR Size Guidelines

**Small PRs are preferred:**

- Easier to review
- Faster merge cycles
- Lower risk of conflicts
- Better for rollback if needed

**Guidelines:**

- **Small:** <200 lines changed — Ideal
- **Medium:** 200-500 lines — Acceptable
- **Large:** >500 lines — Consider splitting

**Exception:** Large PRs acceptable for:
- Initial feature scaffolding
- Major refactors (with discussion)
- Auto-generated code (lockfiles, etc.)

---

## Review Process

### For Contributors

**After Submitting PR:**

1. **CI Checks:** Wait for automated checks to pass
2. **Reviewer Assignment:** Maintainers will assign reviewers
3. **Address Feedback:** Respond to comments promptly
4. **Push Updates:** Make requested changes
5. **Re-Request Review:** After addressing all comments

**Responding to Feedback:**

- **Be Open:** Feedback is about code, not you personally
- **Ask Questions:** If feedback is unclear, ask for clarification
- **Explain Decisions:** If you disagree, explain your reasoning respectfully
- **Be Patient:** Reviews may take 2-3 business days

### For Reviewers

**Review Checklist:**

**Functionality:**
- [ ] Code does what PR description claims
- [ ] No unintended side effects
- [ ] Error handling is appropriate

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] No code duplication (DRY principle)
- [ ] TypeScript types are accurate
- [ ] No unused variables or imports

**Accessibility:**
- [ ] Semantic HTML used
- [ ] ARIA labels appropriate
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] No bundle bloat
- [ ] Async operations handled properly

**Testing:**
- [ ] Tests cover new code
- [ ] Edge cases considered
- [ ] Tests are not brittle

**Documentation:**
- [ ] README updated if needed
- [ ] Comments added for complex logic
- [ ] API changes documented

**Ethical Considerations:**
- [ ] No overstated claims
- [ ] Privacy implications considered
- [ ] Inclusive language used
- [ ] Transparent about limitations

**Providing Feedback:**

- **Be Constructive:** Suggest improvements, don't just criticize
- **Be Specific:** Point to exact lines and explain why
- **Be Respectful:** Assume good intent
- **Acknowledge Positives:** Call out good practices
- **Provide Context:** Explain *why* something should change

**Feedback Examples:**

❌ **Bad:** "This is wrong."

✅ **Good:** "This function could be more efficient by using `Array.filter()` instead of a loop. Here's an example: [code snippet]"

---

✅ **Good:** "Great use of semantic HTML here! The `<nav>` element with `aria-label` makes this very accessible."

### Approval and Merge

**Requirements for Merge:**

- ✅ All CI checks passing
- ✅ At least 1 approving review (maintainer)
- ✅ All review comments resolved
- ✅ Branch up-to-date with `main`
- ✅ No merge conflicts

**Merge Methods:**

- **Squash and Merge:** Default for most PRs (keeps history clean)
- **Rebase and Merge:** For PRs with well-structured commit history
- **Merge Commit:** Rarely used (major features with multiple contributors)

---

## Recognition and Attribution

### Contributors

All contributors are recognized in the project:

- **GitHub Contributors Page:** Automatic attribution
- **CONTRIBUTORS.md:** Manual curation (future)
- **Release Notes:** Significant contributions highlighted

### How to Be Recognized

- Contributions via Pull Requests are automatically tracked
- For non-code contributions (design, documentation, review), open a PR adding yourself to CONTRIBUTORS.md:

```markdown
## Contributors

- **Your Name** (@github-username) — [Contribution area]
```

### Contribution Types Recognized

- Code (features, fixes, tests)
- Documentation (guides, tutorials, translations)
- Design (UI/UX, branding, assets)
- Accessibility (audits, remediations, advocacy)
- Governance (policy reviews, ethical assessments)
- Community (mentoring, issue triage, support)

---

## Contact Information

### Questions and Support

**GitHub Issues:**

- **Bug Reports:** Use `bug` label
- **Feature Requests:** Use `enhancement` label
- **Questions:** Use `question` label or GitHub Discussions

**Email:**

- **General:** contact@quantumpoly.ai
- **Technical:** engineering@quantumpoly.ai
- **Ethics/Governance:** trust@quantumpoly.ai

**Response Times:**

- GitHub: 2-3 business days
- Email: Within 1 week
- Security issues: Within 24 hours (email trust@quantumpoly.ai)

### Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead:

1. Email trust@quantumpoly.ai with details
2. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. We will respond within 24 hours
4. Coordinated disclosure after fix

---

## License

By contributing to QuantumPoly, you agree that your contributions will be licensed under the same license as the project (MIT License).

You also affirm that:

- You have the legal right to contribute the code
- Your contribution does not violate any third-party rights
- You understand that your contribution may be publicly attributed to you

---

## Thank You!

Your contributions make QuantumPoly better for everyone. Whether you're fixing a typo, adding a feature, or improving accessibility, every contribution matters.

We're grateful for your time, expertise, and commitment to building ethical, accessible, and transparent AI systems.

**Happy contributing! 🚀**

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Feedback:** Open GitHub issue with label `documentation` or `meta`

