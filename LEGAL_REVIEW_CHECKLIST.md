# Legal Review Checklist — Imprint & Policy Compliance

**Document Purpose:** This checklist ensures Imprint (Legal Notice) pages meet jurisdictional requirements and are ready for legal sign-off before production deployment.

**Scope:** Imprint pages for all locales (EN, DE, ES, FR, IT, TR)  
**Last Updated:** October 17, 2025  
**Version:** v1.0.0

---

## Jurisdictional Requirements

### German Law (TMG/RStV)

The German Telemedia Act (TMG) and Interstate Broadcasting Treaty (RStV) require specific disclosures for commercial websites:

- [ ] **§5 TMG — Provider identification**
  - Legal name of entity
  - Legal form (e.g., GmbH, AG, GbR)
  - Registered office address (street, postal code, city)
  - Contact details (email, optionally phone/fax)

- [ ] **§5 TMG — Registration details**
  - Commercial register number (HRB/HRA number)
  - Registration court (e.g., Amtsgericht Berlin)
  - VAT identification number (Umsatzsteuer-ID)

- [ ] **§5 TMG — Authorized representatives**
  - Names of managing directors or partners
  - If applicable: liquidator information

- [ ] **§55 RStV — Editorial responsibility**
  - Name and address of person responsible for content
  - Must be a natural person (not just "Content Team")

- [ ] **Professional regulations** (if applicable)
  - Supervisory authority
  - Professional title and country of origin
  - Applicable professional regulations

### EU General Requirements

- [ ] **Contact information**
  - Valid email address for legal notices
  - Response within reasonable timeframe documented

- [ ] **Online Dispute Resolution (ODR)**
  - Link to EU ODR platform: https://ec.europa.eu/consumers/odr/
  - Email address provided
  - Statement on consumer arbitration participation

- [ ] **Privacy policy link**
  - Clearly linked from Imprint

### Spanish Requirements (if applicable)

- [ ] **LSSI-CE compliance** (Ley de Servicios de la Sociedad de la Información)
  - Company identification
  - Fiscal identification number (NIF/CIF)
  - Registered office

### French Requirements (if applicable)

- [ ] **LCEN compliance** (Loi pour la Confiance dans l'Économie Numérique)
  - Company name and legal form
  - Share capital
  - SIRET/SIREN number
  - Publication director (Directeur de la publication)

### Italian Requirements (if applicable)

- [ ] **D.Lgs. 70/2003 compliance**
  - Company details
  - VAT number (Partita IVA)
  - Chamber of Commerce registration

---

## Required Imprint Fields

### Company Information

- [ ] **Legal name** — Full registered company name
- [ ] **Legal form** — Entity type (e.g., GmbH, LLC, Corp, Ltd)
- [ ] **Registered address**
  - [ ] Street and number
  - [ ] Postal code
  - [ ] City
  - [ ] Country
- [ ] **Registration number** — Commercial register or equivalent
- [ ] **Registration authority** — Court or registry office
- [ ] **VAT ID** — If applicable and required by jurisdiction

### Contact Information

- [ ] **General inquiries email** — contact@quantumpoly.ai
- [ ] **Legal inquiries email** — legal@quantumpoly.ai
- [ ] **Phone number** — If required by jurisdiction
- [ ] **Website URL** — https://quantumpoly.ai

### Responsible Parties

- [ ] **Content responsibility (§55 RStV)**
  - [ ] Full name (natural person)
  - [ ] Address
  - [ ] Email: content@quantumpoly.ai

- [ ] **Managing directors / Authorized representatives**
  - [ ] Names listed
  - [ ] Roles specified

### Supervisory & Professional Information

- [ ] **Supervisory authority** — If required by business type/jurisdiction
- [ ] **Professional regulations** — If applicable (lawyers, medical, financial services)
- [ ] **Professional title** — Country of origin if professional services

### Technical & Hosting Information

- [ ] **Hosting provider name**
- [ ] **Hosting provider address**
- [ ] **Hosting provider contact**

### Legal Disclaimers

- [ ] **Liability for content** — Disclaimer present
- [ ] **Liability for links** — Disclaimer for external links
- [ ] **Copyright notice** — Intellectual property statement
- [ ] **Trademarks** — Statement on trademark ownership
- [ ] **Data protection reference** — Link to Privacy Policy
- [ ] **Informational disclaimer** — "Does not constitute legal advice"

---

## Verification Checklist

### Content Accuracy

- [ ] All placeholder text `[To be specified]` removed
- [ ] All `[INSERT: ...]` template fields filled with actual data
- [ ] No `TODO`, `FIXME`, or temporary notes remain
- [ ] Company details are current and accurate
- [ ] Contact information is functional and monitored
- [ ] Email addresses are active and forwarding correctly

### Formatting & Consistency

- [ ] Formatting consistent across all locales (EN, DE, ES, FR, IT, TR)
- [ ] Address formatting follows local conventions (e.g., DE uses PLZ before city)
- [ ] Date formats appropriate for locale
- [ ] Currency symbols correct if mentioned
- [ ] Phone numbers in international format if applicable

### Locale-Specific Requirements

- [ ] **EN version** — Complete and serves as master
- [ ] **DE version** — Full TMG/RStV compliance
- [ ] **ES version** — LSSI-CE compliance if targeting Spain
- [ ] **FR version** — LCEN compliance if targeting France
- [ ] **IT version** — D.Lgs. 70/2003 compliance if targeting Italy
- [ ] **TR version** — Turkish Law No. 5651 compliance if applicable

### Accessibility & Usability

- [ ] Clear heading hierarchy (H1 → H2 → H3)
- [ ] Contact information easily scannable
- [ ] No broken internal links
- [ ] No broken external links (ODR platform, privacy policy)
- [ ] Email links use `mailto:` protocol
- [ ] Print-friendly formatting

---

## Legal Sign-Off Template

Use this template for formal legal approval. Legal reviewer must explicitly approve before production deployment.

```markdown
## Legal Approval — Imprint Review

**Reviewer Information:**

- **Name:** [Legal Reviewer Full Name]
- **Role:** [Position/Title]
- **Date:** [YYYY-MM-DD]
- **Review ID:** [Internal tracking reference, if applicable]

**Scope of Review:**

- [ ] EN — English Imprint
- [ ] DE — German Imprint
- [ ] ES — Spanish Imprint
- [ ] FR — French Imprint
- [ ] IT — Italian Imprint
- [ ] TR — Turkish Imprint

**Compliance Verification:**

- [ ] German TMG/RStV requirements met (if applicable)
- [ ] EU general requirements met
- [ ] Jurisdiction-specific requirements met (ES/FR/IT)
- [ ] All required fields present and accurate
- [ ] No legal advice disclaimers missing
- [ ] Contact information verified and functional

**Approval Status:**

- ✅ **APPROVED** — Ready for production deployment
- ⚠️ **CONDITIONAL APPROVAL** — Approved with noted conditions (see Notes)
- ❌ **REJECTED** — Requires corrections before re-review

**Notes / Conditions:**
[Any conditions, follow-up actions, or clarifications needed]

**Follow-Up Actions:**

- [ ] [Action 1 — Owner: Name, Due: YYYY-MM-DD]
- [ ] [Action 2 — Owner: Name, Due: YYYY-MM-DD]

**Signature:**  
[Digital signature or approval confirmation method]

**Approval Date:** [YYYY-MM-DD]
```

---

## Post-Approval Checklist

After legal sign-off:

- [ ] Legal approval recorded in PR description or issue
- [ ] Approval permalink saved to project documentation
- [ ] `status: "published"` set in frontmatter
- [ ] `lastReviewed` and `nextReviewDue` updated
- [ ] Changes merged to main branch
- [ ] Deployment verified in staging environment
- [ ] Production deployment scheduled/completed
- [ ] Legal team notified of deployment completion

---

## Deferred Items

If any requirements cannot be met immediately, document them here:

| Item              | Reason               | Owner        | Due Date   | Status |
| ----------------- | -------------------- | ------------ | ---------- | ------ |
| [Example: VAT ID] | Pending registration | Finance Team | 2025-11-01 | Open   |

---

## Review Cycle

**Quarterly reviews** recommended for Imprint pages:

- Verify company details remain current
- Check contact information still functional
- Update regulatory references if laws change
- Confirm compliance with new jurisdictional requirements

**Next review due:** [YYYY-MM-DD]

---

## References

### Legal Frameworks

- **German TMG** (Telemediengesetz): https://www.gesetze-im-internet.de/tmg/
- **German RStV** (Rundfunkstaatsvertrag): Interstate Broadcasting Treaty
- **EU eCommerce Directive** (2000/31/EC)
- **EU ODR Platform**: https://ec.europa.eu/consumers/odr/
- **Spanish LSSI-CE** (Ley 34/2002)
- **French LCEN** (Loi 2004-575)
- **Italian D.Lgs. 70/2003**

### Internal Documentation

- [Policy Content Guide](docs/POLICY_CONTENT_GUIDE.md)
- [Automated Validation Guide](docs/POLICY_CONTENT_GUIDE.md#automated-validation--merge-gates)
- [Imprint Pages](content/policies/imprint/)

---

**Document Control:**

- **Author:** Legal & Compliance Team
- **Approver:** [Legal Lead Name]
- **Version History:**
  - v1.0.0 (2025-10-17) — Initial checklist
