#!/bin/bash
# Block 10.8 Lighthouse Accessibility Audit Runner
# Runs Lighthouse on all accessible pages across multiple locales

set -e

ROUTES=(
  ""
  "/ethics"
  "/gep"
  "/accessibility"
  "/contact"
  "/governance"
  "/governance/dashboard"
  "/governance/review"
  "/governance/autonomy"
)

LOCALES=("en" "de" "es" "fr" "it" "tr")

OUTPUT_DIR="reports/lighthouse/block10.8"
mkdir -p "$OUTPUT_DIR"

echo "======================================"
echo "Block 10.8 Lighthouse Audit"
echo "======================================"
echo ""

for locale in "${LOCALES[@]}"; do
  echo "Scanning locale: $locale"
  
  for route in "${ROUTES[@]}"; do
    route_name=$(echo "$route" | sed 's/\//\_/g' | sed 's/^_//')
    if [ -z "$route_name" ]; then
      route_name="home"
    fi
    
    url="http://localhost:3000/${locale}${route}"
    output_file="${OUTPUT_DIR}/${route_name}-${locale}.json"
    log_file="${OUTPUT_DIR}/${route_name}-${locale}.log"
    
    echo "  Testing: $url"
    
    # Run lighthouse with custom output path (need to modify script or use lighthouse CLI directly)
    # For now, we'll use the existing script and copy files
    LH_URL="$url" node scripts/lighthouse-a11y.mjs > "$log_file" 2>&1 || true
    
    # Copy the generated report
    if [ -f "reports/lighthouse/accessibility.json" ]; then
      cp "reports/lighthouse/accessibility.json" "$output_file"
    fi
    
    # Small delay to avoid overwhelming the server
    sleep 1
  done
  
  echo ""
done

echo "======================================"
echo "Lighthouse audit complete!"
echo "Results saved to: $OUTPUT_DIR"
echo "======================================"

