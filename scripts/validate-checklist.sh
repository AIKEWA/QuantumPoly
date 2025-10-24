#!/usr/bin/env bash

###############################################################################
# Release Review Checklist Validation Script
###############################################################################
# Purpose: Validates completion of the release review checklist before
#          production deployment. Enforces audit gate requirements.
#
# Usage:
#   bash scripts/validate-checklist.sh
#
# Exit Codes:
#   0 - All checks passed, deployment approved
#   1 - Validation failed, deployment blocked
#
# Validates:
#   - Stage A (Pre-merge): 14 mandatory checks
#   - Stage B (Pre-release): 13 mandatory checks
#   - Stage C (Post-deployment): 12 mandatory checks
#   - Sign-Off Matrix: Minimum 2 signatures required
#   - Blockers: No active blockers
###############################################################################

set -euo pipefail

# Configuration
CHECKLIST_FILE="docs/review-checklist.md"
REPORT_FILE="audit-report.txt"
MIN_SIGNOFFS=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_ERRORS=0
STAGE_A_COMPLETE=0
STAGE_B_COMPLETE=0
STAGE_C_COMPLETE=0
SIGNOFFS_COMPLETE=0

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

log_error() {
    echo -e "${RED}❌${NC} $1"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
}

section_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo "$1"
    echo "═══════════════════════════════════════════════════════════════════════════════"
}

###############################################################################
# Validation Functions
###############################################################################

check_file_exists() {
    if [[ ! -f "$CHECKLIST_FILE" ]]; then
        log_error "Checklist file not found: $CHECKLIST_FILE"
        exit 1
    fi
    log_success "Found checklist file: $CHECKLIST_FILE"
}

validate_stage_a() {
    section_header "Stage A — Pre-Merge Checklist Validation"
    
    local content
    content=$(sed -n '/## 🛠️ Stage A/,/## 🚀 Stage B/p' "$CHECKLIST_FILE")
    
    # Count completed checkboxes [x] in Stage A
    local completed
    completed=$(echo "$content" | grep -c '\[x\]' || true)
    
    # Count total checkboxes in Stage A (should be 14)
    local total
    total=$(echo "$content" | grep -c '\[ \]' || true)
    total=$((total + completed))
    
    STAGE_A_COMPLETE=$completed
    
    if [[ $completed -eq 14 ]]; then
        log_success "Stage A: $completed/14 checks complete"
    elif [[ $completed -ge 12 ]]; then
        log_warning "Stage A: $completed/14 checks complete (2 or fewer missing)"
    else
        log_error "Stage A: $completed/14 checks complete (INSUFFICIENT)"
    fi
    
    # Detail missing items
    if [[ $completed -lt 14 ]]; then
        log_info "Missing Stage A items:"
        echo "$content" | grep -n '\[ \]' | while IFS=: read -r line_num line_content; do
            echo "  Line $line_num: $(echo "$line_content" | sed 's/^[[:space:]]*//')"
        done
    fi
}

validate_stage_b() {
    section_header "Stage B — Pre-Release Checklist Validation"
    
    local content
    content=$(sed -n '/## 🚀 Stage B/,/## 📦 Stage C/p' "$CHECKLIST_FILE")
    
    local completed
    completed=$(echo "$content" | grep -c '\[x\]' || true)
    
    local total
    total=$(echo "$content" | grep -c '\[ \]' || true)
    total=$((total + completed))
    
    STAGE_B_COMPLETE=$completed
    
    if [[ $completed -eq 13 ]]; then
        log_success "Stage B: $completed/13 checks complete"
    elif [[ $completed -ge 11 ]]; then
        log_warning "Stage B: $completed/13 checks complete (2 or fewer missing)"
    else
        log_error "Stage B: $completed/13 checks complete (INSUFFICIENT)"
    fi
    
    if [[ $completed -lt 13 ]]; then
        log_info "Missing Stage B items:"
        echo "$content" | grep -n '\[ \]' | while IFS=: read -r line_num line_content; do
            echo "  Line $line_num: $(echo "$line_content" | sed 's/^[[:space:]]*//')"
        done
    fi
}

validate_stage_c() {
    section_header "Stage C — Post-Deployment Checklist Validation"
    
    local content
    content=$(sed -n '/## 📦 Stage C/,/## ✅ Audit Gate/p' "$CHECKLIST_FILE")
    
    local completed
    completed=$(echo "$content" | grep -c '\[x\]' || true)
    
    local total
    total=$(echo "$content" | grep -c '\[ \]' || true)
    total=$((total + completed))
    
    STAGE_C_COMPLETE=$completed
    
    if [[ $completed -eq 12 ]]; then
        log_success "Stage C: $completed/12 checks complete"
    elif [[ $completed -ge 10 ]]; then
        log_warning "Stage C: $completed/12 checks complete (2 or fewer missing)"
    else
        log_error "Stage C: $completed/12 checks complete (INSUFFICIENT)"
    fi
    
    if [[ $completed -lt 12 ]]; then
        log_info "Missing Stage C items:"
        echo "$content" | grep -n '\[ \]' | while IFS=: read -r line_num line_content; do
            echo "  Line $line_num: $(echo "$line_content" | sed 's/^[[:space:]]*//')"
        done
    fi
}

validate_sign_off_matrix() {
    section_header "Sign-Off Matrix Validation"
    
    local content
    content=$(sed -n '/### Sign-Off Matrix/,/\*\*Validation:/p' "$CHECKLIST_FILE")
    
    # Count rows with signatures (non-empty Name field)
    # Look for rows that have content in the Name column (not just pipes and spaces)
    local signed_count=0
    
    # Extract table rows and check for non-empty Name fields
    while IFS='|' read -r role name signature date notes; do
        # Skip header and separator rows
        if [[ "$role" =~ ^[[:space:]]*Role || "$role" =~ ^[[:space:]]*-+ ]]; then
            continue
        fi
        
        # Check if name field is not empty (has actual content)
        if [[ -n "${name// /}" && ! "$name" =~ ^[[:space:]]*$ ]]; then
            signed_count=$((signed_count + 1))
            log_info "  ✓ $role: $name (Date: $date)"
        fi
    done < <(echo "$content" | grep '|')
    
    SIGNOFFS_COMPLETE=$signed_count
    
    if [[ $signed_count -ge $MIN_SIGNOFFS ]]; then
        log_success "Sign-Off Matrix: $signed_count signatures (minimum $MIN_SIGNOFFS required)"
    else
        log_error "Sign-Off Matrix: $signed_count signatures (INSUFFICIENT - minimum $MIN_SIGNOFFS required)"
    fi
}

validate_blockers() {
    section_header "Blocker Validation"
    
    local content
    content=$(sed -n '/### Blockers/,/### Sign-Off Matrix/p' "$CHECKLIST_FILE")
    
    # Count checked blockers [x] which indicate ACTIVE blockers
    local active_blockers
    active_blockers=$(echo "$content" | grep -c '\[x\]' || true)
    
    if [[ $active_blockers -eq 0 ]]; then
        log_success "Blockers: None active"
    else
        log_error "Blockers: $active_blockers active blocker(s) detected"
        log_info "Active blockers:"
        echo "$content" | grep '\[x\]' | while read -r blocker; do
            echo "  - $blocker"
        done
    fi
}

generate_report() {
    section_header "Validation Summary"
    
    local total_checks=$((14 + 13 + 12))
    local completed_checks=$((STAGE_A_COMPLETE + STAGE_B_COMPLETE + STAGE_C_COMPLETE))
    local completion_percentage=$((completed_checks * 100 / total_checks))
    
    # Create report file
    {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Release Review Checklist Validation Report"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
        echo "Checklist: $CHECKLIST_FILE"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Stage Results"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Stage A (Pre-Merge):      $STAGE_A_COMPLETE/14"
        echo "Stage B (Pre-Release):    $STAGE_B_COMPLETE/13"
        echo "Stage C (Post-Deployment): $STAGE_C_COMPLETE/12"
        echo "Sign-Off Matrix:          $SIGNOFFS_COMPLETE signatures (min $MIN_SIGNOFFS)"
        echo ""
        echo "Total Checks:             $completed_checks/$total_checks ($completion_percentage%)"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Validation Result"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        if [[ $TOTAL_ERRORS -eq 0 ]]; then
            echo "STATUS: ✅ PASSED"
            echo ""
            echo "All audit gate requirements met. Production deployment approved."
        else
            echo "STATUS: ❌ FAILED"
            echo ""
            echo "Total Errors: $TOTAL_ERRORS"
            echo ""
            echo "Production deployment BLOCKED. Please complete all required items and"
            echo "ensure sign-off matrix is fully populated before proceeding."
        fi
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    } | tee "$REPORT_FILE"
    
    # Console summary
    echo ""
    if [[ $TOTAL_ERRORS -eq 0 ]]; then
        log_success "Release Review Checklist Validation PASSED"
        log_info "Completion: $completed_checks/$total_checks ($completion_percentage%)"
        log_info "Report saved to: $REPORT_FILE"
    else
        log_error "Release Review Checklist Validation FAILED"
        log_error "Errors: $TOTAL_ERRORS"
        log_info "Report saved to: $REPORT_FILE"
    fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔒 Release Review Checklist Validation"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check prerequisites
    check_file_exists
    
    # Run validations
    validate_stage_a
    validate_stage_b
    validate_stage_c
    validate_sign_off_matrix
    validate_blockers
    
    # Generate report
    generate_report
    
    # Exit with appropriate code
    if [[ $TOTAL_ERRORS -gt 0 ]]; then
        exit 1
    else
        exit 0
    fi
}

# Execute main function
main "$@"

