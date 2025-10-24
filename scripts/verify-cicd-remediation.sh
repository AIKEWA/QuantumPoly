#!/bin/bash

# CI/CD Remediation Verification Script
# Verifies all 6 tasks from the remediation plan are implemented correctly
# Usage: ./scripts/verify-cicd-remediation.sh

# Note: Removed 'set -e' to allow script to continue on check failures

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=================================="
echo "CI/CD Remediation Verification"
echo "=================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Function to print results
print_result() {
    local status=$1
    local message=$2
    
    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
        ((PASS_COUNT++))
    elif [ "$status" == "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
        ((FAIL_COUNT++))
    elif [ "$status" == "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
        ((WARN_COUNT++))
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Task 1: Build Job
echo "Task 1: Verify Build Job"
echo "-------------------------"
if grep -q "^  build:" .github/workflows/ci.yml; then
    print_result "PASS" "Build job exists in ci.yml"
    
    if grep -A 5 "^  build:" .github/workflows/ci.yml | grep -q "needs: \[lint, typecheck, test\]"; then
        print_result "PASS" "Build job depends on lint, typecheck, test"
    else
        print_result "FAIL" "Build job dependencies incorrect"
    fi
    
    if grep -A 30 "^  build:" .github/workflows/ci.yml | grep -q "npm run build"; then
        print_result "PASS" "Build job runs 'npm run build'"
    else
        print_result "FAIL" "Build job missing 'npm run build' command"
    fi
    
    if grep -A 40 "^  build:" .github/workflows/ci.yml | grep -q "upload-artifact@v4"; then
        print_result "PASS" "Build job uploads artifacts"
    else
        print_result "FAIL" "Build job missing artifact upload"
    fi
else
    print_result "FAIL" "Build job missing from ci.yml"
fi
echo ""

# Task 2: Coverage Thresholds
echo "Task 2: Verify Coverage Thresholds"
echo "-----------------------------------"
if [ -f jest.config.js ]; then
    # Check if jq is available
    if command -v jq &> /dev/null; then
        # Extract thresholds (this is a simplified check since jest.config.js is JS, not JSON)
        if grep -A 8 "global: {" jest.config.js | grep -q "branches: 85"; then
            print_result "PASS" "Coverage threshold branches: 85%"
        else
            print_result "FAIL" "Coverage threshold branches not 85%"
        fi
        
        if grep -A 8 "global: {" jest.config.js | grep -q "functions: 85"; then
            print_result "PASS" "Coverage threshold functions: 85%"
        else
            print_result "FAIL" "Coverage threshold functions not 85%"
        fi
        
        if grep -A 8 "global: {" jest.config.js | grep -q "lines: 85"; then
            print_result "PASS" "Coverage threshold lines: 85%"
        else
            print_result "FAIL" "Coverage threshold lines not 85%"
        fi
        
        if grep -A 8 "global: {" jest.config.js | grep -q "statements: 85"; then
            print_result "PASS" "Coverage threshold statements: 85%"
        else
            print_result "FAIL" "Coverage threshold statements not 85%"
        fi
    else
        print_result "WARN" "jq not installed, skipping JSON validation"
        if grep -q "branches: 85" jest.config.js && grep -q "functions: 85" jest.config.js && \
           grep -q "lines: 85" jest.config.js && grep -q "statements: 85" jest.config.js; then
            print_result "PASS" "All coverage thresholds appear to be 85%"
        else
            print_result "FAIL" "Coverage thresholds may not all be 85%"
        fi
    fi
else
    print_result "FAIL" "jest.config.js not found"
fi
echo ""

# Task 3: SBOM Generation
echo "Task 3: Verify SBOM Generation"
echo "-------------------------------"
if grep -q "^  sbom:" .github/workflows/ci.yml; then
    print_result "PASS" "SBOM job exists in ci.yml"
    
    if grep -A 5 "^  sbom:" .github/workflows/ci.yml | grep -q "needs: build"; then
        print_result "PASS" "SBOM job depends on build"
    else
        print_result "FAIL" "SBOM job doesn't depend on build"
    fi
    
    if grep -A 30 "^  sbom:" .github/workflows/ci.yml | grep -q "@cyclonedx/cyclonedx-npm"; then
        print_result "PASS" "SBOM job uses CycloneDX"
    else
        print_result "FAIL" "SBOM job missing CycloneDX"
    fi
    
    if grep -A 40 "^  sbom:" .github/workflows/ci.yml | grep -q "upload-artifact@v4"; then
        print_result "PASS" "SBOM job uploads artifacts"
    else
        print_result "FAIL" "SBOM job missing artifact upload"
    fi
    
    if grep -A 40 "^  sbom:" .github/workflows/ci.yml | grep -q "retention-days: 30"; then
        print_result "PASS" "SBOM artifact retention: 30 days"
    else
        print_result "WARN" "SBOM artifact retention may not be 30 days"
    fi
else
    print_result "FAIL" "SBOM job missing from ci.yml"
fi
echo ""

# Task 4: Documentation
echo "Task 4: Verify Policy Documentation"
echo "------------------------------------"
if [ -f README.md ]; then
    if grep -q "Coverage Policy" README.md; then
        print_result "PASS" "Coverage Policy section exists in README"
    else
        print_result "FAIL" "Coverage Policy section missing from README"
    fi
    
    if grep -q "SBOM Policy" README.md; then
        print_result "PASS" "SBOM Policy section exists in README"
    else
        print_result "FAIL" "SBOM Policy section missing from README"
    fi
    
    if grep -q "85%" README.md | head -5 | grep -qi "coverage"; then
        print_result "PASS" "85% coverage threshold documented"
    else
        print_result "WARN" "85% coverage threshold may not be documented"
    fi
    
    if grep -qi "cyclonedx" README.md; then
        print_result "PASS" "CycloneDX mentioned in documentation"
    else
        print_result "FAIL" "CycloneDX not mentioned in documentation"
    fi
    
    if grep -q "Production Environment Configuration" README.md; then
        print_result "PASS" "Production environment section exists"
    else
        print_result "FAIL" "Production environment section missing"
    fi
else
    print_result "FAIL" "README.md not found"
fi
echo ""

# Task 5: Production Environment Setup Guide
echo "Task 5: Verify Production Environment Guide"
echo "--------------------------------------------"
if [ -f docs/PRODUCTION_ENVIRONMENT_SETUP.md ]; then
    print_result "PASS" "Production environment setup guide exists"
    
    if grep -q "Required reviewers" docs/PRODUCTION_ENVIRONMENT_SETUP.md; then
        print_result "PASS" "Guide includes reviewer setup instructions"
    else
        print_result "FAIL" "Guide missing reviewer setup"
    fi
    
    if grep -q "Deployment branches" docs/PRODUCTION_ENVIRONMENT_SETUP.md; then
        print_result "PASS" "Guide includes deployment branch configuration"
    else
        print_result "FAIL" "Guide missing deployment branch config"
    fi
    
    if grep -q "Verification" docs/PRODUCTION_ENVIRONMENT_SETUP.md; then
        print_result "PASS" "Guide includes verification steps"
    else
        print_result "FAIL" "Guide missing verification steps"
    fi
else
    print_result "FAIL" "Production environment setup guide missing"
fi
echo ""

# Task 6: Preview Deployment Reference
echo "Task 6: Verify Preview Deployment Reference"
echo "--------------------------------------------"
if grep -q "preview.yml" .github/workflows/ci.yml; then
    print_result "PASS" "Preview deployment reference exists in ci.yml"
    
    if grep -B 2 -A 2 "preview.yml" .github/workflows/ci.yml | grep -q "NOTE:"; then
        print_result "PASS" "Reference includes explanatory comment"
    else
        print_result "WARN" "Reference may lack explanatory context"
    fi
else
    print_result "FAIL" "Preview deployment reference missing from ci.yml"
fi
echo ""

# Summary
echo "=================================="
echo "Verification Summary"
echo "=================================="
echo ""
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${YELLOW}Warnings: $WARN_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Implementation complete.${NC}"
    exit 0
elif [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  All critical checks passed with $WARN_COUNT warnings.${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAIL_COUNT critical checks failed. Review implementation.${NC}"
    exit 1
fi

