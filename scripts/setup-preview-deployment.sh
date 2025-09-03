#!/bin/bash

# QuantumPoly Preview Deployment Setup Script
# This script automates the setup of preview deployments with Lighthouse CI and Storybook a11y testing

set -e

echo "🚀 QuantumPoly Preview Deployment Setup"
echo "======================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm --version) is available"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

print_success "Git repository detected"

# Install dependencies
print_step "Installing required dependencies..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Install new dependencies
npm install -D @storybook/addon-a11y @storybook/test @lhci/cli

print_success "Dependencies installed successfully"

# Verify Storybook configuration
print_step "Verifying Storybook configuration..."

if [ ! -f ".storybook/main.ts" ] && [ ! -f ".storybook/main.js" ]; then
    print_error "Storybook configuration not found. Please ensure Storybook is properly set up."
    exit 1
fi

# Check if a11y addon is configured
if grep -q "@storybook/addon-a11y" .storybook/main.* 2>/dev/null; then
    print_success "Storybook a11y addon is configured"
else
    print_warning "Storybook a11y addon not found in configuration. Please add it manually."
fi

# Verify Lighthouse CI configuration
print_step "Verifying Lighthouse CI configuration..."

if [ -f ".lighthouserc.js" ]; then
    print_success "Lighthouse CI configuration found"
else
    print_warning "Lighthouse CI configuration not found. It should have been created during setup."
fi

# Test local builds
print_step "Testing local builds..."

# Build Storybook
echo "Building Storybook..."
if npm run build-storybook; then
    print_success "Storybook build successful"
else
    print_error "Storybook build failed. Please check the output above for errors."
    exit 1
fi

# Build Next.js app
echo "Building Next.js application..."
if npm run build; then
    print_success "Next.js build successful"
else
    print_error "Next.js build failed. Please check the output above for errors."
    exit 1
fi

# Test Storybook a11y tests (if they exist)
print_step "Testing Storybook accessibility tests..."
if npm run storybook:test --silent 2>/dev/null; then
    print_success "Storybook a11y tests passed"
else
    print_warning "Storybook a11y tests had issues. This is normal if components need accessibility improvements."
fi

# Check GitHub workflows
print_step "Checking GitHub Actions workflows..."

if [ -f ".github/workflows/preview.yml" ]; then
    print_success "Preview deployment workflow found"
else
    print_warning "Preview deployment workflow not found"
fi

if [ -f ".github/workflows/ci.yml" ]; then
    if grep -q "storybook-a11y" .github/workflows/ci.yml; then
        print_success "CI workflow includes Storybook a11y tests"
    else
        print_warning "CI workflow may not include Storybook a11y tests"
    fi
else
    print_warning "Main CI workflow not found"
fi

# Vercel CLI check
print_step "Checking Vercel CLI setup..."

if command -v vercel &> /dev/null; then
    print_success "Vercel CLI is installed ($(vercel --version))"
    
    # Check if user is logged in
    if vercel whoami &> /dev/null; then
        print_success "Logged in to Vercel as: $(vercel whoami)"
    else
        print_warning "Not logged in to Vercel. Run 'vercel login' to authenticate."
    fi
else
    print_warning "Vercel CLI not installed. Install with: npm install -g vercel@latest"
fi

# Documentation check
print_step "Checking documentation..."

DOCS_MISSING=0

if [ -f "docs/adr/ADR-003-preview-deployments.md" ]; then
    print_success "Preview deployment ADR found"
else
    print_warning "Preview deployment ADR not found"
    DOCS_MISSING=1
fi

if [ -f "docs/adr/ADR-004-lighthouse-a11y.md" ]; then
    print_success "Lighthouse & A11y ADR found"
else
    print_warning "Lighthouse & A11y ADR not found"
    DOCS_MISSING=1
fi

if [ -f "docs/ACCESSIBILITY_GUIDE.md" ]; then
    print_success "Accessibility guide found"
else
    print_warning "Accessibility guide not found"
    DOCS_MISSING=1
fi

if [ -f "docs/PREVIEW_DEPLOYMENT_SETUP.md" ]; then
    print_success "Setup guide found"
else
    print_warning "Setup guide not found"
    DOCS_MISSING=1
fi

# GitHub secrets reminder
print_step "GitHub repository secrets setup reminder..."

echo ""
echo "Please ensure the following secrets are configured in your GitHub repository:"
echo "  (Settings > Secrets and variables > Actions)"
echo ""
echo "  🔑 VERCEL_TOKEN       - Your Vercel access token"
echo "  🏢 VERCEL_ORG_ID      - Your Vercel organization ID"  
echo "  📦 VERCEL_PROJECT_ID  - Your Vercel project ID"
echo ""
echo "To get these values:"
echo "  1. Run 'vercel login' to authenticate"
echo "  2. Run 'vercel link' in your project directory"
echo "  3. Get token from https://vercel.com/account/tokens"
echo ""

# Final recommendations
print_step "Setup recommendations..."

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔧 Configure GitHub repository secrets (see above)"
echo "2. 🧪 Create a test pull request to verify the workflow"
echo "3. 🔍 Review Lighthouse CI results and accessibility scores"
echo "4. 📚 Update team documentation and training materials"
echo "5. 🛡️  Set up monitoring for deployment costs and performance"
echo ""

if [ $DOCS_MISSING -eq 1 ]; then
    echo "⚠️  Some documentation files are missing. Consider regenerating the complete setup."
    echo ""
fi

echo "🎯 Quality Gates Summary:"
echo "  • Accessibility score must be 1.0 (required)"
echo "  • Performance score should be ≥ 0.9 (warning)"
echo "  • SEO score should be ≥ 0.9 (warning)"
echo "  • All Storybook stories tested for accessibility"
echo ""

print_success "Setup verification complete!"

echo ""
echo "🚀 Your QuantumPoly project is ready for automated preview deployments!"
echo "   Create a pull request to see the magic in action."
echo ""

# Optional: Run a quick Lighthouse test if user wants
read -p "Would you like to run a quick Lighthouse test on localhost? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Running Lighthouse test on localhost..."
    
    # Start the Next.js server in the background
    npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    sleep 5
    
    # Run Lighthouse CI
    if npx lhci autorun --collect.url="http://localhost:3000" --collect.numberOfRuns=1; then
        print_success "Lighthouse test completed successfully!"
    else
        print_warning "Lighthouse test had issues. Check the output above."
    fi
    
    # Stop the server
    kill $SERVER_PID 2>/dev/null || true
    echo "Server stopped."
fi

echo ""
echo "Happy coding! 🎉"
