#!/bin/bash

# verify-scripts-compilation.sh
# Verifies that compiled JS scripts are up-to-date with their TypeScript sources.

set -e

echo "🔍 Verifying governance scripts compilation..."

# Store current git status of scripts directory
CHANGED_FILES_BEFORE=$(git status --porcelain scripts/)

# Run the build
npm run build:scripts

# Store status after build
CHANGED_FILES_AFTER=$(git status --porcelain scripts/)

# If files changed, fail the check
if [ "$CHANGED_FILES_BEFORE" != "$CHANGED_FILES_AFTER" ]; then
  echo "❌ Error: Compilation resulted in file changes. Scripts were not up-to-date."
  echo "The following files changed:"
  # Show diff of what changed (roughly)
  git diff scripts/
  echo ""
  echo "Please run 'npm run build:scripts' locally and commit the result."
  exit 1
else
  echo "✅ Success: All governance scripts are up-to-date."
  exit 0
fi
