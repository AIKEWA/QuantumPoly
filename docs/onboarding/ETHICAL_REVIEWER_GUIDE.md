# Ethical Reviewer Guide

**Conducting Ethical and Transparency Reviews for QuantumPoly**

This guide is for contributors responsible for reviewing policy pages, ethical communications, and governance processes. It provides frameworks, checklists, and examples for conducting thorough ethical reviews.

**Target Audience:** Governance team members, ethics reviewers, policy editors  
**Estimated Time:** 30 minutes to understand framework  
**Version:** 1.0.0

---

## Table of Contents

1. [Role and Responsibilities](#role-and-responsibilities)
2. [Ethical Review Framework](#ethical-review-framework)
3. [Policy Page Review Checklist](#policy-page-review-checklist)
4. [Language Framing Guidelines](#language-framing-guidelines)
5. [Evidence-Based Claims Verification](#evidence-based-claims-verification)
6. [Pull Request Review Process](#pull-request-review-process)
7. [When to Escalate](#when-to-escalate)
8. [Resources and References](#resources-and-references)

---

## Role and Responsibilities

### Purpose

Ethical reviewers ensure that QuantumPoly's public communications:

- Accurately represent capabilities and limitations
- Use responsible, non-hyperbolic language
- Provide evidence for claims
- Maintain accessibility and inclusivity
- Align with our ethical principles

### Scope

**In Scope:**

- Policy pages (`content/policies/`)
- Public-facing documentation (README, ONBOARDING)
- Marketing or outreach materials (future blog posts, case studies)
- Governance documents (ledger entries, reports)
- Claims about AI capabilities or performance

**Out of Scope:**

- Internal technical documentation (unless public-facing)
- Code comments or commit messages (unless claims are made)
- Private communications or internal discussions

### Authority

Ethical reviewers have the authority to:

- Request changes to language or framing
- Block publication of content with unsupported claims
- Escalate to governance team for major concerns
- Suggest alternatives and improvements

---

## Ethical Review Framework

### Core Principles

Use these principles as evaluation criteria:

#### 1. Transparency

**Definition:** Open communication about processes, limitations, and decision-making.

**Evaluation Questions:**

- Are capabilities clearly explained?
- Are limitations acknowledged?
- Are decision-making processes disclosed?
- Is uncertainty communicated where it exists?

**Red Flags:**

- Vague claims without specifics
- Omission of known limitations
- Black-box descriptions of processes

#### 2. Evidence-Based Claims

**Definition:** All assertions backed by implementation, testing, or documented research.

**Evaluation Questions:**

- Is this claim verifiable?
- Is evidence provided (links, data, references)?
- Are metrics measurable and specific?
- Is the claim proportional to the evidence?

**Red Flags:**

- "World-leading," "revolutionary," "unmatched" (superlatives without evidence)
- Absolute statements ("guarantee," "perfect," "zero errors")
- Vague metrics ("significantly improved," "much better")

#### 3. Responsible Language

**Definition:** Cautious framing that acknowledges uncertainty and evolving nature of technology.

**Evaluation Questions:**

- Is language appropriately cautious?
- Are aspirations clearly distinguished from current state?
- Are trade-offs acknowledged?
- Is humility present in descriptions?

**Red Flags:**

- Overconfident predictions
- Dismissal of risks or challenges
- Marketing speak in technical documentation

#### 4. Inclusivity

**Definition:** Content accessible and respectful to diverse audiences.

**Evaluation Questions:**

- Is language accessible to non-technical readers?
- Are technical terms explained or linked to glossary?
- Is language inclusive (gender, ability, culture)?
- Are multiple perspectives considered?

**Red Flags:**

- Jargon without explanation
- Ableist or exclusionary language
- Assumptions about audience knowledge

---

## Policy Page Review Checklist

### Pre-Review Preparation

Before reviewing a policy page:

1. **Read the Current Version:**
   - Understand context and scope
   - Note sections that seem unclear or questionable

2. **Check Front Matter:**
   ```yaml
   ---
   title: 'Policy Title'
   summary: 'Brief description'
   status: 'in-progress' | 'published'
   owner: 'Team <email>'
   lastReviewed: 'YYYY-MM-DD'
   nextReviewDue: 'YYYY-MM-DD'
   version: 'vX.Y.Z'
   ---
   ```
   - Verify all fields present and accurate
   - Check status aligns with content maturity

3. **Review Related Implementation:**
   - For technical claims, verify code implementation
   - Check governance ledger for related entries
   - Review CI/CD reports for metrics cited

### Detailed Review Checklist

#### 1. Accuracy

- [ ] All claims are factually correct
- [ ] Technical details are precise
- [ ] Version numbers and dates are current
- [ ] Contact information is correct
- [ ] Links are functional (no 404s)

#### 2. Evidence

- [ ] Specific claims link to evidence (code, docs, reports)
- [ ] Metrics are measurable and verifiable
- [ ] "Regular" activities specify frequency
- [ ] Implementation status clearly stated (current vs. planned)

**Examples:**

| Claim | Evidence Needed |
|-------|----------------|
| "We conduct regular audits" | Link to audit schedule or ledger entries |
| "95% accessibility score" | Link to Lighthouse report or CI artifact |
| "Diverse teams" | Diversity metrics or reframe as aspiration |

#### 3. Language Framing

- [ ] Uses cautious language ("strive to," "working toward")
- [ ] Avoids absolutes ("guarantee," "always," "never")
- [ ] Distinguishes aspirations from current reality
- [ ] Acknowledges limitations and uncertainties
- [ ] Transparent about trade-offs

**Good Examples:**

- "We are working toward building diverse teams across all functions."
- "Our systems may reflect biases present in training data."
- "This document evolves as we learn and as technology advances."

**Bad Examples:**

- "We guarantee complete security."
- "Our AI is unbiased and fair."
- "We are the world's leading AI ethics company."

#### 4. Accessibility

- [ ] Proper heading hierarchy (H2 → H3, no skips)
- [ ] Descriptive link text (not "click here")
- [ ] No visual-only content (charts have alt text)
- [ ] Lists and tables used appropriately
- [ ] Language complexity appropriate for audience

#### 5. Inclusivity

- [ ] Gender-neutral language ("they" not "he/she")
- [ ] Ableist terms avoided (no "blind test," "sanity check")
- [ ] Technical jargon explained or linked
- [ ] Multiple audience personas considered
- [ ] Cultural sensitivity maintained

#### 6. Transparency

- [ ] Limitations acknowledged
- [ ] Uncertainties communicated
- [ ] Review and update process explained
- [ ] Contact mechanism provided
- [ ] Governance integration referenced (where applicable)

---

## Language Framing Guidelines

### Cautious vs. Overconfident Language

| Overconfident (❌) | Cautious (✅) |
|-------------------|---------------|
| "We guarantee..." | "We strive to..." / "We aim to..." |
| "Perfect results" | "High-quality results" / "Results meeting X standard" |
| "Never fails" | "Designed to minimize failures" |
| "Always accurate" | "Accurate in most cases" / "X% accuracy rate" |
| "Revolutionary" | "Innovative" / "Novel approach" |
| "World-leading" | "Committed to excellence" |

### Current vs. Aspirational

**Clear Distinctions:**

- **Current:** "We currently maintain...", "Our systems include...", "We have implemented..."
- **Aspirational:** "We are working toward...", "Our goal is to...", "We aim to achieve..."

**Examples:**

✅ **Good:**
```
We are working toward building diverse teams. Currently, we have 
implemented inclusive hiring practices and are tracking progress 
toward our diversity goals.
```

❌ **Bad:**
```
We have diverse teams.
```

### Acknowledging Limitations

**Template:**

```
While we [current capability], we acknowledge that [limitation]. 
We are actively [action to address] and welcome [feedback mechanism].
```

**Example:**

✅ **Good:**
```
While we implement multiple safety checks to filter harmful content,
we acknowledge that no system is perfect. We are actively improving 
our detection methods and welcome user reports of issues.
```

---

## Evidence-Based Claims Verification

### Types of Evidence

| Claim Type | Required Evidence | Example |
|------------|-------------------|---------|
| Performance metrics | CI/CD reports, Lighthouse audits | "Lighthouse score ≥90" → Link to `reports/lighthouse/` |
| Frequency claims | Schedule or logs | "Quarterly reviews" → Link to governance ledger or calendar |
| Implementation claims | Code or documentation | "WCAG 2.2 AA compliance" → Link to accessibility testing guide |
| Process claims | Process documentation | "Code review required" → Link to CONTRIBUTING.md |

### Verification Process

1. **Identify Claims:**
   - Highlight all factual assertions
   - Note any superlatives or absolutes

2. **Check for Evidence:**
   - Is evidence provided (link, reference, data)?
   - Is evidence accessible and current?
   - Is evidence proportional to claim?

3. **Suggest Alternatives if Needed:**
   - Reframe as aspiration
   - Add evidence link
   - Soften language

**Example Verification:**

**Original Claim:**
```
We conduct regular accessibility audits.
```

**Verification Questions:**

- What is "regular"? (weekly, monthly, quarterly?)
- Where are audit results?
- Who conducts audits?

**Suggested Revision:**
```
We conduct quarterly accessibility audits using Lighthouse and 
manual testing. Results are documented in our transparency ledger 
at /dashboard and reports are available in the CI/CD artifacts.
```

---

## Pull Request Review Process

### When Policy Pages are Modified

**Review Trigger:**

Any PR that modifies files in `content/policies/` requires ethical review.

**Review Steps:**

1. **Read PR Description:**
   - Understand rationale for changes
   - Check if related issues are linked

2. **Review Diff:**
   - Focus on changed sections
   - Compare before and after language
   - Check if claims are added, modified, or removed

3. **Apply Checklist:**
   - Use [Policy Page Review Checklist](#policy-page-review-checklist)
   - Document findings in PR comments

4. **Provide Feedback:**
   - Be specific (quote exact language)
   - Suggest alternatives
   - Explain rationale for requested changes

5. **Approve or Request Changes:**
   - Approve if all criteria met
   - Request changes if issues identified
   - Block merge if critical issues present

### Comment Template

```markdown
## Ethical Review Feedback

### Summary

[Brief assessment of changes]

### Specific Issues

#### Issue 1: [Category - e.g., Unsupported Claim]

**Location:** Line X

**Current Text:**
> [Quote problematic text]

**Issue:**
[Explain what's problematic]

**Suggested Revision:**
> [Provide alternative]

**Rationale:**
[Explain why change is needed]

---

#### Issue 2: [Category]

...

### Overall Recommendation

- [ ] Approve (no issues identified)
- [ ] Request Changes (minor issues)
- [ ] Block Merge (critical issues)

**Additional Notes:**
[Any other observations or suggestions]
```

---

## When to Escalate

### Escalation Triggers

**Escalate to governance team when:**

1. **Disagreement on Language:**
   - Contributor disagrees with framing recommendation
   - Trade-off between accuracy and engagement

2. **Major Policy Changes:**
   - New commitments or obligations
   - Changes to ethical principles
   - Legal or compliance implications

3. **Uncertainty About Evidence:**
   - Unclear if claim is accurate
   - Cannot verify implementation
   - Metrics seem inflated

4. **Ethical Concerns:**
   - Potential harm to users
   - Privacy implications
   - Bias or fairness issues
   - Accessibility barriers

### Escalation Process

1. **Document Concern:**
   - Write clear summary of issue
   - Provide context and evidence
   - Suggest possible resolutions

2. **Contact Governance Team:**
   - Email: trust@quantumpoly.ai
   - GitHub: Tag `@governance-team` in PR
   - Meeting: Request review in next governance sync

3. **Await Resolution:**
   - Do not approve PR while escalation pending
   - Participate in discussion if invited
   - Implement decision once made

---

## Resources and References

### Internal Documentation

- **[ETHICS_COMMUNICATIONS_AUDIT.md](../ETHICS_COMMUNICATIONS_AUDIT.md)** — Comprehensive audit report with examples
- **[ETHICAL_GOVERNANCE_IMPLEMENTATION.md](../../ETHICAL_GOVERNANCE_IMPLEMENTATION.md)** — Governance framework
- **[TRUST_POLICIES_IMPLEMENTATION_SUMMARY.md](../../TRUST_POLICIES_IMPLEMENTATION_SUMMARY.md)** — Trust policies overview

### Ethical Frameworks

- **IEEE 7000:** Standard for ethical AI design
- **EU AI Act:** Regulatory framework for AI systems
- **ACM Code of Ethics:** Computing professionals' ethical principles

### Responsible AI Communication

- **AI Now Institute:** [Research and reports on AI ethics](https://ainowinstitute.org/)
- **Partnership on AI:** [Best practices for AI communication](https://partnershiponai.org/)
- **Ada Lovelace Institute:** [AI transparency guidelines](https://www.adalovelaceinstitute.org/)

### Accessibility Standards

- **WCAG 2.2 Guidelines:** [W3C Accessibility Standards](https://www.w3.org/WAI/WCAG22/quickref/)
- **WebAIM:** [Articles on accessible content](https://webaim.org/articles/)

---

## Training and Practice

### Sample Review Exercise

**Review this ethics policy excerpt:**

```markdown
QuantumPoly's revolutionary AI systems guarantee perfect results 
every time. Our world-leading algorithms ensure zero errors and 
complete fairness. We have diverse teams and conduct regular audits 
to maintain our unmatched standards.
```

**Issues to Identify:**

1. "Revolutionary" — Hyperbole, unsupported
2. "Guarantee perfect results every time" — Absolute, unrealistic
3. "World-leading" — Superlative, unverifiable
4. "Zero errors" — Absolute, unrealistic
5. "Complete fairness" — Absolute, complex concept
6. "Diverse teams" — No evidence provided
7. "Regular audits" — Frequency unspecified
8. "Unmatched standards" — Superlative, unsupported

**Suggested Revision:**

```markdown
QuantumPoly develops AI systems designed to deliver high-quality, 
reliable results. We implement multiple safety checks and testing 
procedures to minimize errors and identify biases. We are working 
toward building diverse teams and conduct quarterly audits 
(documented in our transparency ledger) to continuously improve 
our practices.
```

---

## Contact and Support

**Questions About Ethical Review?**

- Governance Team: trust@quantumpoly.ai
- GitHub Discussions: Tag with `ethics` or `governance`

**Reporting Ethical Concerns:**

- Confidential: trust@quantumpoly.ai
- Non-urgent: Open GitHub issue with `ethics` label

**Response Time:**

- Escalations: Within 24-48 hours
- General questions: Within 1 week

---

## Conclusion

As an ethical reviewer, you play a critical role in ensuring QuantumPoly's communications are transparent, accurate, and responsible. Your careful review helps build trust with users, stakeholders, and the broader community.

**Remember:**

- Be constructive, not punitive
- Suggest alternatives, don't just criticize
- Prioritize transparency and user trust
- Escalate when uncertain

**Thank you for your commitment to ethical excellence!**

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Feedback:** Open GitHub issue with label `documentation` or `governance`

