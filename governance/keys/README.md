# GPG Public Keys

This directory contains public GPG keys used to verify transparency ledger signatures.

## Current Key

- **File:** `ethical.pub` (to be generated)
- **Purpose:** Signing ethical governance ledger entries
- **Algorithm:** RSA 4096-bit
- **Created:** TBD
- **Expires:** TBD

## Generating Keys

Follow the instructions in `/docs/governance/KEY_MANAGEMENT.md` to:

1. Generate a GPG key pair
2. Export the public key to this directory
3. Configure CI/CD with the private key

## Verification

To verify ledger signatures:

```bash
# Import public key
gpg --import governance/keys/ethical.pub

# Verify entire ledger
npm run ethics:verify-ledger
```

## Security

- ⚠️ **NEVER commit private keys to this directory**
- ✅ Only `.pub` files should be committed
- ✅ Private keys belong in password managers or CI secrets
