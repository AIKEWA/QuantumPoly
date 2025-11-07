# Incident Reports Directory

This directory contains incident reports for critical failures that require human intervention.

## File Naming Convention

`INC-YYYYMMDD-<slug>.md`

## Triggers

- `ledger_break`: Integrity violation in governance ledger
- `audit_fail`: Audit cycle failure or critical finding
- `security_violation`: Security breach or unauthorized access

## Process

1. Pause affected workflows
2. File incident report using naming convention
3. Run hotfix playbook
4. Document decisions and resolution
5. Update post-mortem analysis
