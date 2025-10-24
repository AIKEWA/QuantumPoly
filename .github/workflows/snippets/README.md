# Reusable Workflow Snippets

This directory contains modular, reusable GitHub Actions workflows that can be called from other workflows using the `workflow_call` trigger.

## Available Snippets

### GPG Ledger Signing (`gpg-sign-ledger.yml`)

**Purpose:** Cryptographically sign governance ledger artifacts with GPG for tamper-evident audit trails.

**Usage:**

```yaml
jobs:
  sign-ledger:
    uses: ./.github/workflows/snippets/gpg-sign-ledger.yml
    with:
      ledger_file_path: governance/ledger/releases/2025-10-23-v1.0.0.json
      sign_enabled: true
    secrets:
      GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
      GPG_KEY_ID: ${{ secrets.GPG_KEY_ID }}
```

**Documentation:**

- **Integration Guide:** `/docs/governance/GPG_SIGNING_WORKFLOW.md`
- **Validation:** `/docs/governance/GPG_SIGNING_VALIDATION.md`
- **Example:** `/docs/examples/release-with-gpg-signing.yml`

**Compliance:**

- SOC 2 CC6.1 (Audit log integrity)
- ISO 27001 A.12.4.2 (Log protection)
- EWA-GOV Control 7.4 (Cryptographic proof)
- EWA-HIL-02 (Manual override governance)

---

## Creating New Snippets

When adding new reusable workflows:

1. **Name with purpose:** `action-target.yml` (e.g., `verify-signatures.yml`, `deploy-service.yml`)
2. **Use `workflow_call` trigger:**
   ```yaml
   on:
     workflow_call:
       inputs:
         # Define inputs
       secrets:
         # Define required secrets
   ```
3. **Document thoroughly:** Add comprehensive comments in YAML
4. **Create documentation:** Add guide in `/docs/` with usage examples
5. **Add to this README:** Update the "Available Snippets" section
6. **Test independently:** Validate workflow in isolation before integration

---

## Best Practices

- **Single responsibility:** Each snippet should do one thing well
- **Idempotent operations:** Re-running should produce consistent results
- **Graceful degradation:** Skip when prerequisites missing (don't fail)
- **No secret exposure:** Never echo secrets to logs
- **Clear logging:** Use structured output with emoji markers
- **Artifact retention:** Set appropriate retention days (7/30/90)
- **Version documentation:** Update docs when changing snippet behavior

---

## Related Documentation

- [CI/CD Architecture](../../docs/CICD_GPG_LEDGER_INTEGRATION.md)
- [Workflow Maintenance Guide](../../docs/CI_WORKFLOW_MAINTENANCE_GUIDE.md)

**Last Updated:** 2025-10-23
