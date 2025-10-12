#!/bin/bash
# Newsletter API Manual Test Script
# 
# This script runs a series of cURL tests against the newsletter API
# to verify all response scenarios work correctly.
#
# Usage:
#   1. Start the dev server: npm run dev
#   2. In another terminal: chmod +x scripts/test-newsletter-api.sh && ./scripts/test-newsletter-api.sh

set -e

API_URL="${API_URL:-http://localhost:3000/api/newsletter}"
TIMESTAMP=$(date +%s)

echo "🧪 Newsletter API Test Suite"
echo "=============================="
echo "API URL: $API_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

run_test() {
  local test_name="$1"
  local expected_status="$2"
  local expected_key="$3"
  local curl_args="${@:4}"
  
  test_count=$((test_count + 1))
  echo -e "${YELLOW}Test $test_count: $test_name${NC}"
  
  # Run curl and capture status and response
  response=$(curl -s -w "\n%{http_code}" $curl_args)
  status=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  # Check status code
  if [ "$status" != "$expected_status" ]; then
    echo -e "${RED}  ✗ FAIL: Expected status $expected_status, got $status${NC}"
    echo "  Response: $body"
    fail_count=$((fail_count + 1))
    return 1
  fi
  
  # Check message key
  message_key=$(echo "$body" | grep -o '"messageKey":"[^"]*"' | cut -d'"' -f4)
  if [ "$message_key" != "$expected_key" ]; then
    echo -e "${RED}  ✗ FAIL: Expected messageKey '$expected_key', got '$message_key'${NC}"
    echo "  Response: $body"
    fail_count=$((fail_count + 1))
    return 1
  fi
  
  echo -e "${GREEN}  ✓ PASS: Status $status, messageKey: $message_key${NC}"
  pass_count=$((pass_count + 1))
  echo ""
}

echo "Starting tests..."
echo ""

# Test 1: Invalid email format
run_test \
  "Invalid email format (400)" \
  "400" \
  "newsletter.invalidEmail" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}'

# Test 2: Missing email field
run_test \
  "Missing email field (400)" \
  "400" \
  "newsletter.invalidEmail" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 3: Valid new subscription
unique_email="test-${TIMESTAMP}@example.com"
run_test \
  "Valid new subscription (201)" \
  "201" \
  "newsletter.success" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$unique_email\"}"

# Test 4: Rate limiting (immediate resubmission)
rate_limit_email="ratelimit-${TIMESTAMP}@example.com"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$rate_limit_email\"}" > /dev/null

run_test \
  "Rate limiting - immediate resubmission (429)" \
  "429" \
  "newsletter.rateLimited" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$rate_limit_email\"}"

# Test 5: Email normalization (case insensitive)
norm_email="normalize-${TIMESTAMP}@example.com"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$norm_email\"}" > /dev/null

run_test \
  "Email normalization - uppercase triggers rate limit (429)" \
  "429" \
  "newsletter.rateLimited" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"  $(echo $norm_email | tr '[:lower:]' '[:upper:]')  \"}"

# Test 6: Unsupported HTTP method
test_count=$((test_count + 1))
echo -e "${YELLOW}Test $test_count: Unsupported HTTP method GET (405)${NC}"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL")
status=$(echo "$response" | tail -n 1)
if [ "$status" = "405" ]; then
  echo -e "${GREEN}  ✓ PASS: Status 405${NC}"
  pass_count=$((pass_count + 1))
else
  echo -e "${RED}  ✗ FAIL: Expected status 405, got $status${NC}"
  fail_count=$((fail_count + 1))
fi
echo ""

# Summary
echo "=============================="
echo "Test Summary"
echo "=============================="
echo "Total tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
if [ $fail_count -gt 0 ]; then
  echo -e "${RED}Failed: $fail_count${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
fi

