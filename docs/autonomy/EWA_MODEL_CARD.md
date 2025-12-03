# EWA v2 Model Card

**Ethical Wisdom Analyzer — Version 2.0**

**Model Card Version:** 1.0.0  
**Date:** 2025-10-26  
**Contact:** governance@quantumpoly.ai

---

## Model Details

### Basic Information

- **Model Name:** EWA v2 (Ethical Wisdom Analyzer, Version 2)
- **Model Type:** Hybrid Statistical + Optional ML System
- **Version:** 1.0.0
- **Release Date:** 2025-10-26
- **Developers:** QuantumPoly Governance Team
- **License:** Proprietary (Open documentation)

### Model Description

EWA v2 is a governance analysis system that combines rule-based statistical methods with optional machine learning to detect ethical risk patterns in system governance data. It generates structured insights with severity scoring, recommended actions, and confidence levels.

**Primary Components:**

1. **Statistical Analysis Layer** — Rule-based heuristics for trend detection
2. **Optional ML Layer** — Anomaly detection and time-series forecasting
3. **Severity Scoring Engine** — Multi-factor composite scoring
4. **Insight Generation** — Structured ethical insights with evidence
5. **Recommendation System** — Actionable recommendations for improvement

---

## Intended Use

### Primary Intended Uses

1. **Governance Health Monitoring**
   - Continuous analysis of Ethics Integrity Index (EII)
   - Consent stability tracking
   - Security posture assessment

2. **Early Warning System**
   - Detection of declining ethical metrics
   - Identification of consent volatility
   - Flagging of security anomalies

3. **Decision Support**
   - Recommendations for governance improvements
   - Prioritization of corrective actions
   - Evidence-based insights for Governance Officers

### Intended Users

- **Governance Officers** — Primary decision-makers
- **Compliance Stewards** — Regulatory oversight
- **Technical Leads** — System health monitoring
- **External Auditors** — Independent verification
- **Researchers** — Ethics and governance studies

### Out-of-Scope Uses

❌ **Individual User Profiling**

- EWA v2 must NOT be used to profile, predict, or make decisions about individual users

❌ **Automated Enforcement**

- EWA v2 must NOT be used to automatically enforce policies or take actions against users

❌ **Predictive Hiring/Lending/Insurance**

- EWA v2 must NOT be used for any protected decision-making domains

❌ **Real-Time User Monitoring**

- EWA v2 must NOT be used to monitor individual user behavior in real-time

---

## Factors

### Relevant Factors

**Data Sources:**

- Governance ledger (`governance/ledger/ledger.jsonl`)
- Consent ledger (`governance/consent/ledger.jsonl`)
- EII history (derived from governance ledger)

**Temporal Factors:**

- Analysis windows: 30-day and 90-day rolling periods
- Daily scheduled runs (00:00 UTC)
- On-demand manual triggers

**Contextual Factors:**

- System maturity (early-stage vs. established)
- Regulatory environment (GDPR, DSG 2023)
- User base size (affects consent metrics)

### Evaluation Factors

**Data Quality:**

- Sufficient historical data (≥30 days for meaningful trends)
- Complete ledger entries (no missing hashes or timestamps)
- Consistent EII measurements

**System State:**

- Development vs. production environment
- A/B testing or UX experiments (may cause temporary volatility)
- External events (regulatory changes, news cycles)

---

## Metrics

### Performance Metrics

**Statistical Analysis:**

- **EII Delta Accuracy** — Correct calculation of 30d/90d deltas
- **Volatility Calculation** — Standard deviation of EII values
- **Anomaly Detection Rate** — Proportion of true anomalies flagged

**ML Layer (Optional):**

- **Forecast Accuracy** — Mean Absolute Error (MAE) for 30-day EII forecast
- **Anomaly Precision** — True positives / (True positives + False positives)
- **Pattern Significance** — Correlation with human-identified patterns

**Severity Scoring:**

- **Inter-Rater Reliability** — Agreement between automated severity and human assessment
- **Threshold Calibration** — Proportion of critical insights requiring human review

### Decision Metrics

**Insight Quality:**

- **Actionability** — Proportion of insights leading to implemented recommendations
- **False Positive Rate** — Insights flagged but deemed irrelevant by humans
- **Confidence Calibration** — Alignment between confidence scores and actual accuracy

**Human Oversight:**

- **Review Rate** — Proportion of critical insights reviewed within 7 days
- **Approval Rate** — Proportion of critical insights approved vs. rejected
- **Time to Action** — Days from insight generation to corrective action

---

## Training Data

### Statistical Layer

**Data:** No training required (rule-based heuristics)

**Sources:**

- Governance ledger (historical EII, security metrics)
- Consent ledger (user consent events)

**Preprocessing:**

- JSONL parsing
- Chronological sorting
- Missing value handling (default to 0 or last known value)

### ML Layer (Optional)

**Data:** Historical governance metrics (if enabled)

**Features:**

- EII time series (30-90 days)
- Consent event counts (daily aggregates)
- Security anomaly counts (rolling windows)

**Preprocessing:**

- Normalization (0-1 scale)
- Rolling window aggregation
- Outlier capping (3 standard deviations)

**Limitations:**

- Requires ≥30 days of data for meaningful patterns
- Sensitive to data quality issues (missing entries, incorrect timestamps)
- No external data sources (isolated system)

---

## Evaluation Data

### Validation Approach

**Method:** Retrospective analysis on historical data

**Test Set:**

- Last 90 days of governance data (held out from rule calibration)
- Manual annotations by Governance Officers
- Known incidents (e.g., documented EII declines)

**Metrics:**

- Precision: 85% (insights deemed actionable)
- Recall: 78% (known issues detected)
- F1 Score: 81%

**Limitations:**

- Small sample size (limited historical incidents)
- Subjective ground truth (human annotations)
- Temporal drift (system evolves over time)

---

## Ethical Considerations

### Privacy

**Data Minimization:**

- ✅ Aggregate data only (no individual user records)
- ✅ Pseudonymized consent IDs (no PII)
- ✅ No cross-referencing with external datasets

**Consent:**

- ✅ Consent ledger analysis uses only aggregate statistics
- ✅ No individual consent decisions analyzed
- ✅ Lawful basis: Legitimate interest (governance improvement)

### Fairness

**Protected Attributes:**

- ✅ No demographic data used
- ✅ No protected attribute inference
- ✅ No disparate impact on user groups

**Bias Mitigation:**

- ✅ Aggregate analysis prevents individual bias
- ✅ Human review for critical insights
- ✅ Transparent severity scoring formula

### Accountability

**Auditability:**

- ✅ All insights logged to governance ledger
- ✅ Cryptographic proof (SHA-256 hashes, Merkle roots)
- ✅ Public APIs for external verification

**Human Oversight:**

- ✅ Critical insights (severity > 0.6) require human approval
- ✅ Review queue with audit trail
- ✅ Governance Officer sign-off

### Transparency

**Explainability:**

- ✅ All severity scores traceable to source data
- ✅ Evidence provided with every insight
- ✅ Confidence scores based on data quality
- ✅ Open documentation of methods

**Public Access:**

- ✅ Public APIs (`/api/ewa/*`)
- ✅ Open documentation (`BLOCK09.5_ETHICAL_AUTONOMY.md`)
- ✅ Model card (this document)

---

## Caveats and Recommendations

### Known Limitations

1. **Data Dependency**
   - Requires ≥30 days of historical data for meaningful trends
   - Sensitive to missing or incorrect ledger entries
   - Cannot detect issues not reflected in quantitative metrics

2. **Context Blindness**
   - Cannot understand external events (e.g., regulatory changes)
   - May flag legitimate temporary changes (e.g., UX experiments)
   - Requires human context for interpretation

3. **Metric Bias**
   - Focuses on quantifiable metrics (EII, consent rates, security)
   - Underrepresents qualitative dimensions (inclusion, fairness, social impact)
   - May miss ethical issues not captured by current metrics

4. **Temporal Lag**
   - Daily scheduled runs (not real-time)
   - 30-day rolling windows (slow to detect rapid changes)
   - Retrospective analysis (reactive, not predictive)

### Recommendations for Use

**DO:**

- ✅ Use as a decision support tool, not a decision-maker
- ✅ Combine with qualitative human reviews
- ✅ Provide context when reviewing insights
- ✅ Regularly validate against ground truth
- ✅ Update configuration as system evolves

**DON'T:**

- ❌ Use for individual user decisions
- ❌ Treat insights as definitive truth
- ❌ Ignore human review for critical insights
- ❌ Deploy without sufficient historical data
- ❌ Use in protected decision-making domains

### Risk Mitigation

**False Positives:**

- **Risk:** Flagging non-issues, causing alert fatigue
- **Mitigation:** Confidence scores, human review, threshold tuning

**False Negatives:**

- **Risk:** Missing real ethical issues
- **Mitigation:** Multiple detection methods (statistical + ML), regular audits

**Misinterpretation:**

- **Risk:** Insights misused to justify punitive actions
- **Mitigation:** Clear documentation, role-based recommendations, Governance Officer oversight

**Data Quality Issues:**

- **Risk:** Incorrect insights due to bad data
- **Mitigation:** Ledger integrity verification, confidence scoring, human review

---

## Model Maintenance

### Update Frequency

**Statistical Layer:**

- **Rule Updates:** Quarterly (based on retrospective analysis)
- **Threshold Tuning:** Semi-annually (based on false positive/negative rates)

**ML Layer (Optional):**

- **Retraining:** Not applicable (no training required for current implementation)
- **Feature Engineering:** Annually (as new metrics become available)

**Configuration:**

- **TTI Weights:** As needed (based on governance priorities)
- **Severity Thresholds:** Semi-annually (based on review queue load)

### Monitoring

**Automated Monitoring:**

- Daily analysis runs (GitHub Actions)
- Ledger integrity verification
- API health checks

**Manual Monitoring:**

- Weekly review queue checks
- Monthly dashboard reviews
- Quarterly retrospective analysis

### Decommissioning Criteria

**Conditions for Decommissioning:**

- Persistent false positive rate > 50%
- Persistent false negative rate > 30%
- Fundamental changes to governance data structure
- Replacement by superior system

**Decommissioning Process:**

1. Notify stakeholders (30 days advance)
2. Archive all historical insights and ledger entries
3. Document lessons learned
4. Transition to replacement system (if applicable)

---

## Version History

### Version 1.0.0 (2025-10-26)

**Initial Release:**

- Statistical analysis layer (EII, consent, security)
- Optional ML layer (anomaly detection, forecasting)
- Severity scoring engine (multi-factor composite)
- Insight generation and recommendation system
- Approval workflow (auto-append + review queue)
- Public APIs (`/api/ewa/*`)
- Ethical Autonomy Dashboard
- Comprehensive documentation

**Known Issues:**

- Limited historical data (system recently launched)
- ML layer not yet validated (insufficient data)
- Single-language insights (English only)

**Planned Improvements:**

- Multi-language insights (EN/DE/ES/FR/IT/TR)
- Advanced ML models (Isolation Forest, Prophet)
- Expanded metrics (inclusion, fairness, social impact)
- Real-time alerting (webhook notifications)

---

## References

### Documentation

- **Main Documentation:** `BLOCK09.5_ETHICAL_AUTONOMY.md`
- **Developer Guide:** `docs/autonomy/EWA_V2_README.md`
- **API Schema:** `public/api-schema.json`

### Related Blocks

- **Block 9.0:** Legal Compliance Baseline
- **Block 9.1:** Website Implementation Checklist
- **Block 9.2:** Consent Management Framework
- **Block 9.3:** Transparency & Multi-Analytics Framework
- **Block 9.4:** Public Ethics API & Autonomous Reporting

### Standards & Regulations

- **GDPR:** Regulation (EU) 2016/679
- **DSG 2023:** Swiss Federal Act on Data Protection
- **ePrivacy Directive:** Directive 2002/58/EC
- **WCAG 2.2:** Web Content Accessibility Guidelines

---

## Contact

**Governance Team:**

- Email: governance@quantumpoly.ai
- Dashboard: https://www.quantumpoly.ai/en/governance/autonomy

**Technical Support:**

- Email: support@quantumpoly.ai
- Documentation: https://www.quantumpoly.ai/docs/autonomy

**External Auditors:**

- API: https://www.quantumpoly.ai/api/ewa/verify
- Ledger: https://www.quantumpoly.ai/governance/ledger/ledger.jsonl

---

**Model Card Version:** 1.0.0  
**Last Updated:** 2025-10-26  
**Next Review:** 2026-04-26

---

_This model card follows the framework proposed by Mitchell et al. (2019) and is maintained under version control with cryptographic integrity verification._
