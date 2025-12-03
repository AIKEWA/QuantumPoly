# Block 12.2 – Dashboard Specification: Public Ethics Observatory

**Status:** Conceptual Design (Draft)  
**Parent Block:** [BLOCK12.2_PUBLIC_ETHICS_OBSERVATORY.md](./BLOCK12.2_PUBLIC_ETHICS_OBSERVATORY.md)  
**Target Release:** Q2 2026 (Beta)

---

## Dashboard Purpose & Audience

The **Public Ethics Observatory** (located at `/observatory`) serves as the "Atlas of AI Integrity." Its primary purpose is to transform QuantumPoly from a private governance tool into a **public research institute**, providing a verifiable, scientific window into the ethical performance of algorithmic systems.

Unlike traditional corporate dashboards which focus on operational efficiency, this dashboard focuses on **accountability, traceability, and scientific validity**. It creates a "glass box" environment where internal governance events are exposed as reproducible evidence.

### Primary Audiences

1.  **Policymakers & Regulators:**
    - **Goal:** Verify compliance with frameworks like the EU AI Act (2024/26) and IEEE 7000.
    - **Need:** "Evidence-Based Compliance"—hard proof (ledger hashes) rather than self-reported checkboxes.
2.  **Academic Researchers:**
    - **Goal:** Use QuantumPoly data for peer-reviewed studies on AI ethics.
    - **Need:** Exportable, DOI-citable datasets, stable historical baselines, and clear methodology.
3.  **Civil Society & The Public:**
    - **Goal:** Understand the "health" of the AI systems affecting their lives.
    - **Need:** Interpretable visualizations, "Plain Language" explanations, and trust indicators.

---

## Information Architecture

The application is structured to guide users from high-level global signals down to granular, cryptographic proofs.

### Top-Level Sections

1.  **The Atlas (Global Overview):**
    - A geospatial or topological visualization of active Ethics Nodes.
    - Real-time "Pulse" of global governance activity (events/second).
    - Aggregate **Ethical Integrity Index (EII)** scores by region or sector.

2.  **Integrity Indices (Deep Dive):**
    - **Comparative Benchmarking:** Cross-institutional EII rankings.
    - **Temporal Tracking:** Historical performance of specific models or organizations.
    - **Consent Metrics:** Aggregated indicators of user consent health.

3.  **Ledger & Proofs (The Evidence Room):**
    - Raw explorer for the **Governance Ledger**.
    - Search by Hash / ID / Date.
    - "Verify Proof" tool for external validation of exported datasets.

4.  **Research Lab:**
    - **Data Export:** Download datasets (CSV/JSON/Parquet) with attached provenance proofs.
    - **API Documentation:** Interactive docs for `/api/observatory/global`.
    - **Citation Generator:** Tools to generate BibTeX/DOI references for specific data snapshots.

### User Journeys

- **Journey A: The Regulator's Audit**
  - _Entry:_ Searches for a specific Organization or System ID.
  - _Action:_ Views the "Integrity Scorecard" for that entity.
  - _Drill-down:_ Clicks on a specific dip in the score -> Expands the "Event Log" for that period.
  - _Verification:_ Clicks "Verify Hash" on a controversial decision to confirm it was logged immutably.

- **Journey B: The Researcher's Query**
  - _Entry:_ "Trends in Algorithmic Bias Mitigation (2025-2026)."
  - _Action:_ Uses the "Integrity Indices" view to filter for "Bias Mitigation Events."
  - _Drill-down:_ Selects a cohort of nodes -> Visualizes the trend line.
  - _Export:_ Clicks "Export Dataset for Citation" -> Receives a cryptographically signed package with a DOI.

---

## Visualization Concepts

All visualizations rely on D3.js/Next.js and strictly use aggregated, non-PII data.

### View 1 – The Global Integrity Map (Choropleth/Network)

- **Purpose:** To provide an immediate, visceral sense of the "state of AI ethics" globally.
- **Data Inputs:** Aggregated EII scores from federated nodes, geolocation (region-level only), active node count.
- **Visual Encodings:**
  - **Color Scale:** Diverging scale (e.g., Red-to-Blue or Purple-to-Green) representing the **Ethical Integrity Index**. High integrity = vibrant/stable color; Low integrity = warning color.
  - **Density:** [Inference] Pulse animations indicating real-time governance activity (ledger writes).
  - **Topology:** [Inference] Network links showing cross-verification relationships between nodes (Trust Federation).

### View 2 – Temporal Evolution Charts (The "History of Conscience")

- **Purpose:** To demonstrate that ethics is a trajectory, not a snapshot (aligning with Stage VIII "Education & Adaptivity").
- **Data Inputs:** EII scores over time (t=0 to t=now), specific governance events (flags, overrides).
- **Visual Encodings:**
  - **Line/Area Charts:** showing EII fluctuations.
  - **Event Annotations:** Vertical markers indicating significant governance interventions (e.g., "Human-in-the-loop Override", "Policy Update").
  - **Confidence Intervals:** Shaded areas representing the certainty of the metric (derived from consensus strength).

### View 3 – The Proof Lens (Component)

- **Purpose:** To bridge the gap between UI visualization and cryptographic truth.
- **Data Inputs:** SHA-256 Provenance Hash, Signatures (System + Human), Block Height.
- **Visual Encodings:**
  - **Interaction:** Hovering over _any_ data point in the dashboard reveals a "Proof Card."
  - **Visuals:** Truncated Hash (e.g., `89db...c228`) with a distinct "Copy/Verify" icon.
  - **Status Indicators:** Green Check (Verified on Ledger) vs. Grey (Pending Consensus).

---

## Evidence & Traceability Surfacing

The core differentiator of the Observatory is that **UI elements are indexical to cryptographic proofs.**

1.  **The "Source of Truth" Sidebar:**
    - Every page includes a collapsible sidebar showing the **Ledger State** (current block height, last hash).
    - This constantly reminds the user that the view is a rendering of an immutable chain.

2.  **Click-to-Verify:**
    - Clicking a metric (e.g., "98% Consent Rate") opens a modal showing the **Merkle Proof** path for that aggregate calculation.
    - Includes a direct link to the `/api/observatory/global` endpoint that generated the number.

3.  **Citation Persistence:**
    - [Inference] When a user filters a view, the URL updates to include a hash of the query parameters _and_ the ledger state block. This ensures that sharing a link allows others to see exactly the same data state, enabling reproducibility.

---

## Accessibility & Inclusivity Considerations

- **Color Independence:**
  - Critical metrics (like EII scores) must use **texture patterns** or **iconography** (arrows, shields) in addition to color scales to accommodate color blindness.
  - Use high-contrast palettes (WCAG AA standard minimum) for all text and essential data lines.

- **Screen Reader Optimization:**
  - All D3.js charts must have a hidden, semantic HTML `<table>` fallback or detailed `aria-description` summaries.
  - Interactive "Proof Lens" tooltips must be keyboard accessible (focusable) and announce the proof status explicitly.

- **Cognitive Load:**
  - "Plain Language" toggle: A global switch to simplify technical governance terms (e.g., changing "Governance Ledger Hash" to "Digital Receipt ID").

---

## Open Design Questions / [TODO]

- **[TODO] Data Privacy:** How do we visualize "Global Consent Metrics" without risking re-identification of small cohorts? _Need to define minimum-k anonymity thresholds for the visualizer._
- **[TODO] "Governance Forks":** How does the dashboard display a metric if two federated nodes disagree on the verification? _Need a UI pattern for "Disputed Data"._
- **[Inference] Real-time Scalability:** Can the "Global Map" handle 10,000+ nodes in real-time? _May need to implement vector-tile aggregation for the map view._
- **[Inference] Sustainability:** Should "Premium/Deep" analytics be gated for paid consortium members to fund the Observatory?

---

**Ledger Hash:** `ff122f96f9c6e47d389a6f02b0157b6bd78a35d8557b9bd6c995e5d1b6c7acf4`

---

**Version:** 1.0
**Last Reviewed:** 2025-11-25
**Reviewed By:** EWA
