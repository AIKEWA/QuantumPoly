# FPP-03 — Ledger Schema Standardisation Technical Specification

## 1. Refined Problem Definition

### Current State

The ledger entries in `governance/ledger/*.jsonl` exhibit inconsistent schema usage:

- Some entries use `responsible` (string) to denote authorship.
- Some use `signers` (array of objects) or `responsibleRoles` (array of strings).
- The `signature` field is often missing, null, or buried within `signers`.
- Timestamps are generally present but need enforcement.

### Target Canonical Schema

Every ledger entry must strictly adhere to the following fields regarding authorship and integrity:

- **`author`** (string): A unified field identifying the entity or entities responsible for the entry.
- **`timestamp`** (string, ISO 8601): The time of entry creation.
- **`signature`** (string): A cryptographic signature or `'pending_sign'` if not yet signed.

### Assumptions

- **JSONL Format**: Each line in the target files is a valid, independent JSON object.
- **Environment**: Node.js environment is available for execution.
- **Scope**: Only `governance/ledger/*.jsonl` files are targeted.

## 2. Step-by-Step Migration Procedure

### 2.1 File Discovery and Backup

1.  Identify all `.jsonl` files in `governance/ledger/`.
2.  Create a backup directory `governance/ledger/backup_[TIMESTAMP]/`.
3.  Copy all identified files to the backup directory before modification.

### 2.2 Field Mapping Rules

The normalization script will apply the following transformations in order:

1.  **Author Normalization (`author`)**:
    - **Existing `author`**: Preserve if present.
    - **From `responsible`**: If `author` is missing and `responsible` exists, move `responsible` value to `author`.
    - **From `signers`**: If `author` is missing and `signers` (array) exists, extract `name` or `alias` from each signer object and join with `, ` to form `author`.
    - **From `responsibleRoles`**: If `author` is missing and `responsibleRoles` (array) exists, join values with `, ` to form `author`.
    - **Fallback**: If none of the above exist, mark `author` as `"[UNKNOWN]"`.

2.  **Signature Normalization (`signature`)**:
    - **Existing `signature`**: Preserve if non-empty string.
    - **From `signers`**: If top-level `signature` is missing but `signers` contains a signature (e.g., in a single-signer scenario), extract it. _Constraint: If multiple signers exist, we set top-level to `'pending_sign'` unless a specific aggregate signature logic is defined. For this pass, we default to `'pending_sign'` for complex cases to ensure safety._
    - **Default**: If `signature` is missing, `null`, or empty string, set to `'pending_sign'`.

3.  **Timestamp Preservation (`timestamp`)**:
    - **Existing**: Preserve.
    - **Missing**: If missing, log an error. (Optionally infer from Git commit time, but strictly start with validation failure).

### 2.3 Cleanup

- Remove legacy fields `responsible` and `responsibleRoles` after successful mapping.
- Keep `signers` structure if it contains extra metadata (like individual signatures) that cannot be flattened to a single string signature, but ensure `author` is populated. _Decision: Keep `signers` for historical accuracy if complex, but `author` is the queryable standard._

## 3. Validator Script Specification (`ledger-normalize.mjs`)

### Purpose

To validate schema compliance and normalize inconsistent fields across the governance ledger.

### Usage

```bash
node scripts/ledger-normalize.mjs [target_directory] [--fix] [--dry-run]
```

### Validation Rules

1.  **`author`**: Must be a non-empty string.
2.  **`timestamp`**: Must be a valid ISO 8601 string.
3.  **`signature`**: Must be a non-empty string (defaulting to `'pending_sign'`).

### Output

- **Console**: Summary of files processed, lines modified, and validation errors.
- **Exit Code**: `0` on success (all valid), `1` on failure (validation errors remaining).

## 4. Testing & Verification

### Manual Verification

- Inspect `governance/ledger/ledger.jsonl` lines 1-5.
- Verify `responsible` fields are gone and `author` is present.
- Verify `signature` is present.

### Automated Checks

- Run the script without `--fix` to act as a linter in CI.
