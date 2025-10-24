#!/usr/bin/env bash

###############################################################################
# Governance Ledger Sync Script
###############################################################################
# Purpose: Extracts sign-off matrix from release review checklist and
#          synchronizes to governance ledger for audit trail.
#
# Usage:
#   DEPLOYMENT_URL=https://... bash scripts/audit-sync-ledger.sh
#
# Environment Variables:
#   DEPLOYMENT_URL - Production deployment URL (from workflow output)
#   GITHUB_SHA     - Git commit hash (auto-provided in GitHub Actions)
#   GITHUB_REF     - Git reference (auto-provided in GitHub Actions)
#
# Output:
#   Creates/appends to: governance/ledger/releases/YYYY-MM-DD-vX.Y.Z.json
#
# Ledger Entry Format:
#   {
#     "id": "2025-10-23-release-v1.2.3",
#     "timestamp": "2025-10-23T14:30:00Z",
#     "type": "release_audit",
#     "action": "completed",
#     "version": "v1.2.3",
#     "commit": "abc123def456",
#     "deployment_url": "https://www.quantumpoly.ai",
#     "checklist_hash": "sha256:...",
#     "sign_off_matrix": [...]
#   }
###############################################################################

set -euo pipefail

# Configuration
CHECKLIST_FILE="docs/review-checklist.md"
LEDGER_DIR="governance/ledger/releases"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_PREFIX=$(date -u +"%Y-%m-%d")

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

section_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo "$1"
    echo "═══════════════════════════════════════════════════════════════════════════════"
}

###############################################################################
# Extraction Functions
###############################################################################

extract_version() {
    # Extract version from GITHUB_REF (e.g., refs/tags/v1.2.3)
    if [[ -n "${GITHUB_REF:-}" ]]; then
        if [[ "$GITHUB_REF" =~ refs/tags/(v[0-9]+\.[0-9]+\.[0-9]+) ]]; then
            echo "${BASH_REMATCH[1]}"
            return 0
        fi
    fi
    
    # Fallback: try to get from package.json
    if [[ -f "package.json" ]]; then
        local pkg_version
        pkg_version=$(grep '"version"' package.json | head -1 | sed 's/.*"version":[[:space:]]*"\([^"]*\)".*/\1/')
        if [[ -n "$pkg_version" ]]; then
            echo "v$pkg_version"
            return 0
        fi
    fi
    
    # Final fallback: use timestamp-based version
    echo "v$(date -u +%Y.%m.%d)"
}

extract_commit() {
    # Use GITHUB_SHA if available, otherwise use git
    if [[ -n "${GITHUB_SHA:-}" ]]; then
        echo "${GITHUB_SHA:0:12}"
    elif command -v git &> /dev/null; then
        git rev-parse --short=12 HEAD 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

compute_checklist_hash() {
    if [[ ! -f "$CHECKLIST_FILE" ]]; then
        log_warning "Checklist file not found: $CHECKLIST_FILE"
        echo "sha256:missing"
        return 1
    fi
    
    local hash
    if command -v sha256sum &> /dev/null; then
        hash=$(sha256sum "$CHECKLIST_FILE" | awk '{print $1}')
    elif command -v shasum &> /dev/null; then
        hash=$(shasum -a 256 "$CHECKLIST_FILE" | awk '{print $1}')
    else
        log_warning "No SHA256 utility found (sha256sum or shasum)"
        echo "sha256:unavailable"
        return 1
    fi
    
    echo "sha256:$hash"
}

extract_sign_off_matrix() {
    if [[ ! -f "$CHECKLIST_FILE" ]]; then
        log_warning "Checklist file not found: $CHECKLIST_FILE"
        echo "[]"
        return 1
    fi
    
    local content
    content=$(sed -n '/### Sign-Off Matrix/,/\*\*Validation:/p' "$CHECKLIST_FILE")
    
    local json_array="["
    local first=true
    
    # Parse sign-off table
    while IFS='|' read -r role name signature date notes; do
        # Skip header and separator rows
        if [[ "$role" =~ ^[[:space:]]*Role || "$role" =~ ^[[:space:]]*-+ ]]; then
            continue
        fi
        
        # Trim whitespace
        role=$(echo "$role" | xargs)
        name=$(echo "$name" | xargs)
        date=$(echo "$date" | xargs)
        notes=$(echo "$notes" | xargs)
        
        # Check if row has actual content (non-empty name)
        if [[ -n "$name" && ! "$name" =~ ^[[:space:]]*$ ]]; then
            # Check if signature is checked
            local signed="false"
            if [[ "$signature" =~ \[x\] ]]; then
                signed="true"
            fi
            
            # Add to JSON array
            if [[ "$first" == true ]]; then
                first=false
            else
                json_array+=","
            fi
            
            # Escape quotes in strings
            name=$(echo "$name" | sed 's/"/\\"/g')
            notes=$(echo "$notes" | sed 's/"/\\"/g')
            
            json_array+="{\"role\":\"$role\",\"name\":\"$name\",\"signed\":$signed,\"date\":\"$date\",\"notes\":\"$notes\"}"
        fi
    done < <(echo "$content" | grep '|')
    
    json_array+="]"
    echo "$json_array"
}

###############################################################################
# Ledger Management Functions
###############################################################################

create_ledger_entry() {
    local version="$1"
    local commit="$2"
    local deployment_url="$3"
    local checklist_hash="$4"
    local sign_off_matrix="$5"
    
    local entry_id="${DATE_PREFIX}-release-${version}"
    
    # Create JSON entry
    cat <<EOF
{
  "id": "$entry_id",
  "timestamp": "$TIMESTAMP",
  "type": "release_audit",
  "action": "completed",
  "version": "$version",
  "commit": "$commit",
  "deployment_url": "$deployment_url",
  "checklist_hash": "$checklist_hash",
  "sign_off_matrix": $sign_off_matrix,
  "metadata": {
    "workflow": "vercel-deploy.yml",
    "environment": "production",
    "ref": "${GITHUB_REF:-unknown}"
  }
}
EOF
}

append_to_ledger() {
    local version="$1"
    local ledger_content="$2"
    
    # Ensure ledger directory exists
    mkdir -p "$LEDGER_DIR"
    
    # Create ledger file name
    local ledger_file="${LEDGER_DIR}/${DATE_PREFIX}-${version}.json"
    
    # Check if entry already exists
    if [[ -f "$ledger_file" ]]; then
        log_warning "Ledger entry already exists: $ledger_file"
        log_warning "Skipping append to prevent duplication"
        return 0
    fi
    
    # Write entry to file
    echo "$ledger_content" > "$ledger_file"
    log_success "Ledger entry created: $ledger_file"
    
    # Verify JSON validity
    if command -v jq &> /dev/null; then
        if jq empty "$ledger_file" 2>/dev/null; then
            log_success "JSON structure validated"
        else
            log_warning "JSON validation failed - entry may be malformed"
        fi
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    section_header "🔒 Governance Ledger Sync"
    
    # Extract release metadata
    log_info "Extracting release metadata..."
    local version
    version=$(extract_version)
    log_info "  Version: $version"
    
    local commit
    commit=$(extract_commit)
    log_info "  Commit: $commit"
    
    local deployment_url="${DEPLOYMENT_URL:-https://www.quantumpoly.ai}"
    log_info "  Deployment URL: $deployment_url"
    
    # Compute checklist hash
    section_header "Computing Checklist Hash"
    local checklist_hash
    checklist_hash=$(compute_checklist_hash)
    log_info "  Checklist hash: ${checklist_hash:0:72}..."
    
    # Extract sign-off matrix
    section_header "Extracting Sign-Off Matrix"
    local sign_off_matrix
    sign_off_matrix=$(extract_sign_off_matrix)
    
    # Count signatures
    local sig_count
    if command -v jq &> /dev/null; then
        sig_count=$(echo "$sign_off_matrix" | jq 'length')
        log_info "  Signatures extracted: $sig_count"
        
        # Display signatures
        echo "$sign_off_matrix" | jq -r '.[] | "  ✓ \(.role): \(.name) (\(.date))"'
    else
        log_warning "jq not available - cannot parse sign-off matrix"
    fi
    
    # Create ledger entry
    section_header "Creating Ledger Entry"
    local ledger_entry
    ledger_entry=$(create_ledger_entry "$version" "$commit" "$deployment_url" "$checklist_hash" "$sign_off_matrix")
    
    # Append to ledger
    append_to_ledger "$version" "$ledger_entry"
    
    # Summary
    section_header "Sync Complete"
    log_success "Governance ledger updated successfully"
    log_info "Entry ID: ${DATE_PREFIX}-release-${version}"
    log_info "Timestamp: $TIMESTAMP"
    log_info "Location: ${LEDGER_DIR}/${DATE_PREFIX}-${version}.json"
    
    echo ""
    log_info "Next steps:"
    echo "  1. Commit ledger changes to repository"
    echo "  2. Push to main branch"
    echo "  3. Verify entry in governance dashboard"
    echo ""
}

# Execute main function
main "$@"

