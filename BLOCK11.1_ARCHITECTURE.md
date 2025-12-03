# Block 11.1 Architecture: AI Persona Simulation Environment ("Governance in Silico")

### Architecture Summary

Block 11.1, **"Governance in Silico"**, establishes a simulation layer for the QuantumPoly governance stack. It addresses the critical risk of deploying untested policies to real users by providing a mechanism to validate governance artifacts (policies, transparency notices, consent flows) against **synthetic AI personas** in a controlled environment.

Conceptually, this block acts as a "pre-flight check" or **Ethical Sandbox**. Before any governance logic interacts with live production data or real humans, it is subjected to a battery of scenarios within the simulation. This ensures that potential issues—such as "consent fatigue," high friction, or lack of clarity—are identified and mitigated proactively using only synthetic actors, thereby preserving user privacy and system integrity.

### Main Components

- **CLI Entry Point (`cli/simulate-governance.ts`)**
  - The primary interface for developers and CI/CD pipelines. It accepts arguments for target policies (`--policy`) and test scenarios (`--scenario`), initializes the simulation environment, and reports exit codes based on success/failure criteria.
- **Scenario Loader**
  - Responsible for reading, validating, and normalizing JSON scenario files (`*.json`) from the scenario library. It ensures all referenced data (e.g., personas, context) exists and complies with schema definitions.
- **Persona Engine (`simulator/engine/persona-engine.ts`)**
  - Manages the lifecycle and state of synthetic AI personas. It instantiates actors based on static definitions (`personas.json`) and maintains their dynamic state (e.g., `frustration`, `trust`, `memory`) throughout the simulation steps.
- **Reaction Analyzer (`simulator/engine/reaction-analyzer.ts`)**
  - The core logic component that evaluates how a specific persona perceives a governance artifact. It uses heuristics (Phase 1) or LLM-based analysis (Phase 2) to calculate metrics like `comprehension_score` and `friction_score`.
- **Simulation Orchestrator (`simulator/engine/scenario-injector.ts`)**
  - Coordinates the step-by-step execution of a scenario. It injects governance events into the persona's timeline, triggers the Reaction Analyzer, and updates the persona's state based on the outcome.
- **Metrics Collector**
  - Aggregates data points from the simulation run. It compiles individual persona reactions into high-level metrics (e.g., "Average Friction," "Refusal Rate") for reporting.
- **Reporter**
  - Formats the simulation results into human-readable outputs (Console tables, Markdown summaries) and structured formats (JSON) for downstream consumption or audit logging.

### Data Flows

- **Scenario Loading & Validation**
  - Developer invokes CLI with a target Policy MD and Scenario ID.
  - **Scenario Loader** reads `scenarios/<id>.json` and `personas.json`.
  - Loader validates JSON schemas and ensures strictly synthetic data references.
- **Simulation Execution**
  - **Orchestrator** initializes the specified **Personas** (resetting state to baseline).
  - Orchestrator iterates through Scenario steps.
  - At each step, the **Policy** content is presented to the **Persona Engine**.
  - **Reaction Analyzer** computes the persona's response (e.g., "Confusion," "Acceptance") based on traits (`tech_literacy`) vs. policy complexity.
  - Persona state (`frustration`, `trust`) is updated.
- **Result Aggregation & Output**
  - **Metrics Collector** gathers all step outcomes.
  - **Reporter** generates a pass/fail status based on thresholds (e.g., "Fail if >20% refusal").
  - Results are printed to CLI and optionally saved to `reports/simulation_<timestamp>.json`.

### Sandbox and Ethical Constraints

The architecture enforces a strict **Ethical Sandbox** through the following mechanisms:

- **Synthetic-Only Data:** The `Scenario Loader` and `Persona Engine` are hardcoded to load data _only_ from the `simulator/data/` directory. They have no access to production user databases or PII.
- **Persona Isolation:** AI Personas are ephemeral objects instantiated in memory for the duration of the simulation. They cannot initiate network calls to external services or persist data beyond the simulation report.
- **Operational Segregation:** The simulation runs in a separate process (or container in CI/CD) from the production application, ensuring that simulated high-friction events cannot impact real system performance or metrics.
- **Audit Trace:** Every simulation run logs the `policy_hash`, `scenario_id`, and `persona_version` to the output report, ensuring complete traceability of which logic was tested against which synthetic assumptions.

### Context in QuantumPoly Architecture

- **Upstream: Stage V (Cognitive Governance):** Block 11.1 consumes the Governance Artifacts (Policies, Terms) produced and versioned in Stage V. It serves as the validation gate for these artifacts.
- **Downstream: Stage VI (Closure & Monitoring):** The "Refusal" and "Friction" metrics defined here inform the monitoring dashboards in Stage VI. If live metrics deviate from simulated predictions, it triggers a feedback loop to update the simulation scenarios.
- **Future: Stage VII (Federated Ethical Systems):** The standardized `Persona` and `Scenario` JSON formats are designed to be portable. In a federated setup, nodes can exchange these definitions to run cross-node compatibility simulations (Block 11.0/11.x).
- **Block 11.2 (Governance SDK):** The `simulator/` core module is designed as a library that will be exposed via the Block 11.2 SDK, allowing third-party developers to write their own compliance tests.

### Implementation Phasing

- **Phase 1 – Minimal Viable Simulator (Current Baseline)**
  - **Deliverables:** Core `simulator/` module, `Persona Engine` with basic heuristic `Reaction Analyzer`, CLI entry point `npm run simulate:governance`, and initial `personas.json` (5-10 archetypes).
  - **Goal:** Enable local testing of Markdown policies against basic "Consent Fatigue" scenarios.
  - **Validation:** Successful execution of `npm run simulate:governance` with pass/fail exit codes.

- **Phase 2 – Expanded Scenarios and Metrics**
  - **Deliverables:** Enhanced `Reaction Analyzer` (improved heuristics or lightweight LLM integration), expanded Scenario Library (covering "Transparency Regression," "Dark Pattern Detection"), and structured JSON reporting.
  - **Goal:** Integrate into CI/CD pipeline as a blocking check for governance changes.
  - **Validation:** Automated simulation runs on every PR modifying `content/policies/`.

- **Phase 3 – Federated and Advanced Analysis**
  - **Deliverables:** Federated Scenario support (multi-node conflict simulation), cross-node metric aggregation, and integration with Block 11.3 (Time Capsule) for long-term storage of simulation evidence.
  - **Goal:** Support the full Stage VII Federated Ethical Systems requirements.
  - **Validation:** Successful simulation of a multi-node policy conflict resolution.

---

**Version:** 1.0
**Last Reviewed:** 2025-11-25
**Reviewed By:** EWA
