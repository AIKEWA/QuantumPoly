# RFC-002: Adaptive Ledger Schema v2

**Status:** Draft – Strategic Planning (Stage VIII)  
**Date:** 2025-11-23  
**Author:** Professor Doctor Julius Prompto  
**Target Horizon:** QuantumPoly v2.0 (2026–2027)

---

## 1. Motivation

The current Stage VII ledger provides immutable proof of _past_ actions and _present_ state. However, ethical decision-making in autonomous systems requires a temporal dimension—the ability to evaluate the _future_ trajectory of an action.

To support "Time as an Ethical Dimension" (Block 12.1), we must evolve our data persistence layer. **Adaptive Ledger Schema v2** is proposed to support "Long-Now" governance, where ledger entries store not just static validation results, but also probabilistic future impacts and temporal decay functions.

## 2. Goals

- **Temporal Integration:** Embed "Time Horizons" directly into the block schema (e.g., immediate impact vs. 100-year impact).
- **Probabilistic State:** Allow ledger entries to store _confidence intervals_ and _projected outcomes_ rather than just binary success/failure.
- **Schema Flexibility:** Enable the ledger structure to evolve without hard forks, supporting the dynamic policy changes proposed in the Modular Ethics Framework (MEF).

## 3. Non-Goals

- **Database Selection:** This RFC does not prescribe a specific technology (e.g., SQL vs. NoSQL vs. Blockchain).
- **Byte-Level Optimization:** Optimization is deferred to implementation phases.
- **Migration Plan:** The migration strategy for v1.0 data is out of scope for this conceptual outline.

## 4. High-Level Design

### 4.1. The "Long-Now" Block Structure

A v2 ledger entry is conceptualized to contain:

- **The Act:** The cryptographic signature of the action (standard v1.0 data).
- **The Temporal Vector:** A set of projected ethical scores at $t+0$, $t+10y$, $t+50y$.
- **The Discount Function:** Reference to the mathematical model used to weight future impacts against present needs.

### 4.2. Temporal Ethics Kernel Integration

The ledger serves as the memory backend for the **Temporal Ethics Kernel** (Block 12.1).

- **Write Path:** When an agent proposes an action, the Kernel runs a Trajectory Simulation. The result is written to the ledger as a "Projected Impact."
- **Read Path:** Future audits compare the _actual_ outcome against the _projected_ outcome stored in the ledger to refine the simulation models (Self-Learning).

### 4.3. Layered Architecture

- **Layer 0 (Storage):** Immutable persistence (likely compatible with Stage VII GPG chains).
- **Layer 1 (Semantic):** Adaptive Schema definition that interprets raw storage into evolving ethical concepts.
- **Layer 2 (Cognitive):** The interface for AI agents to query "Ethical Memory."

## 5. Alignment With QuantumPoly Evolution

- **Stage V (Cognitive Governance):** Established the need for governance to understand context. v2 adds "Time" as the ultimate context.
- **Stage VI (Public Baseline):** v2 extends transparency into the future—making predictions public, not just past logs.
- **Stage VII (Federated Ethics):** The consensus mechanism validates the _probabilities_ stored in the Adaptive Ledger, ensuring shared reality across nodes.
- **Stage VIII (Adaptive Governance):** The ledger becomes the "Hippocampus" of the collective AI, storing the wisdom of past predictions to improve future foresight.

## 6. Risks & Open Questions

- **[Speculative Planning] Data Explosion:** Storing trajectory simulations for every action could lead to unmanageable storage growth. Pruning strategies will be critical.
- **[Speculative Planning] Verification Complexity:** validating a probabilistic ledger entry is mathematically harder than validating a static hash.
- **Research Need:** Defining the "Ethical Decay Function"—how rapidly does the relevance of an ethical violation fade over time?
- **Research Need:** Efficient storage formats for multi-dimensional probability clouds.

---

_Note: This document is a forward-looking planning artifact. Details are subject to revision during Stage VIII initiation._
