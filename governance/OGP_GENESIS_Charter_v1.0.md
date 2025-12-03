# OGP-GENESIS Charter v1.0

**Effective Date:** 2027-01-01
**Status:** ACTIVE (Initial Governance Phase)
**Authority:** QuantumPoly Consortium (Transitional Root)

---

## 1. Purpose and Scope

This Charter defines the governance rules for the **Open Governance Protocol (OGP)** during its "Genesis Phase" (Phase 1). It establishes the mechanisms for key management, power delegation, and the eventual transition to a fully decentralized federation.

The primary goal is to ensure the integrity of the **Governance Standards Registry (GSR)** while the ecosystem matures.

## 2. The Genesis Authority

Until the activation of the Federated Consensus Protocol (Stage X), the **QuantumPoly Consortium** serves as the "Genesis Authority."

### 2.1 Responsibilities

- Maintaining the root cryptographic keys for the OGP Registry.
- Ratifying the initial set of normative standards (v1.0 series).
- Certifying the first wave of "OGP Compliant" auditors.
- Managing the emergency circuit-breaking protocols.

### 2.2 Transparency Obligations

All actions taken by the Genesis Authority MUST be:

1.  Logged to the public OGP Ledger.
2.  Cryptographically signed by at least 2 of 3 designated Keyholders.
3.  Published within 24 hours of execution.

## 3. Key Management & Rotation

### 3.1 The Genesis Keys

The integrity of the registry relies on a Multi-Signature Scheme (3-of-5).

- **Key A (Technical Lead):** Held by QuantumPoly Engineering.
- **Key B (Ethics Lead):** Held by the EWA (Ethical Web Alliance).
- **Key C (Legal Lead):** Held by Independent Counsel.
- **Key D (Audit Lead):** Held by Rotating External Auditor.
- **Key E (Community Lead):** Held by DAO Representative (Future).

### 3.2 Rotation Schedule

- **Cycle:** Keys MUST be rotated every **6 months**.
- **Next Rotation:** 2027-07-01.
- **Procedure:**
  1.  Generate new key pairs on air-gapped hardware.
  2.  Publish public keys to `/.well-known/ogp-keys`.
  3.  Sign the "Handover Block" with the old keys.
  4.  Revoke old keys.

## 4. Delegation of Authority

The Genesis Authority may delegate specific powers to "Working Groups."

- **Standards Group:** Authorized to draft and propose spec updates (requires Root ratification).
- **Certification Group:** Authorized to issue "Compliant" badges to nodes (requires Root audit).

## 5. Transition to Decentralization (Sunset Clause)

This Charter is **transitional**. It expires automatically upon the occurrence of:

- **Condition A:** 50 independent organizations running OGP Nodes.
- **Condition B:** 3 consecutive years of incident-free operation.

Upon expiration, authority transfers to the **OGP Federation Council**, elected by the node operators.

---

**Signed:**

- _QuantumPoly Governance Board_
- _Ethical Web Alliance (EWA)_
