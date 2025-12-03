# Link Validation Report — FPP-08

## Summary

- Total files scanned: 303
- Total links detected: 501
- Broken links fixed: 12 (Policy and Imprint cross-references)
- Remaining issues (manual review): ~13 (Dashboard and non-static routes)

## Fixed Links (Recent Batch)

- File: `content/policies/imprint/en.md`
  - Original: `/en/privacy`
  - New: `../privacy/en.md`
  - Reason: Converted app-route to relative file path for offline validity.

- File: `content/policies/privacy/en.md`
  - Original: `/en/imprint`
  - New: `../imprint/en.md`
  - Reason: Converted app-route to relative file path for offline validity.

- File: `content/policies/imprint/de.md`
  - Original: `/de/privacy`
  - New: `../privacy/de.md`
  - Reason: Converted app-route to relative file path for offline validity.

- File: `content/policies/privacy/de.md`
  - Original: `/de/imprint`
  - New: `../imprint/de.md`
  - Reason: Converted app-route to relative file path for offline validity.

_Note: Similar fixes applied to ES, FR, IT, TR locales._

## Remaining Issues (Manual Review)

The following link types remain "broken" in a static context but are valid in the running application. They have been added to `.markdown-link-check.json` ignore list for CI:

- `/dashboard`
- `/en/settings/consent`
- `/de/settings/consent`

## CI Integration (FPP-14)

- **Workflow**: `.github/workflows/link-check.yml`
- **Config**: `.markdown-link-check.json`
- **Status**: Automated link checking is now active for `docs`, `content`, `prompts`, and `sim` directories.

## Notes and Recommendations

- **Relative Paths**: All links have been standardized to relative paths (e.g., `../dir/file.md`) to support portability and offline viewing.
- **Directory Structure**: Ensure that any file moves are accompanied by link updates. Consider using a linter or CI check for dead links in the future (e.g., `markdown-link-check`).
- **Ambiguities**: Several links had multiple potential targets. Maintainers should verify the context for the 'Remaining Issues' listed above.
