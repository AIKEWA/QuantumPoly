# ADR-002: Integration Testing Strategy for Landing Page Composition

**Date:** 2025-01-27  
**Status:** Accepted  
**Context:** QuantumPoly Block 2 - System-Level Component Integration Verification

## Context

While individual components (Hero, About, Vision, NewsletterForm, Footer) had unit tests, there was no system-level verification of how these components work together as a cohesive landing page experience. This gap could lead to integration regressions, accessibility issues, and poor user experience when components interact.

## Decision

Implement a comprehensive integration test suite focused on the complete landing page composition with the following testing dimensions:

### 1. **Heading Hierarchy Validation**
- **Single H1 Rule**: Ensure exactly one H1 element exists (main hero title)
- **Logical Structure**: Verify H2+ elements are properly nested and meaningful
- **SEO Compliance**: Maintain proper heading semantics for search engines
- **Screen Reader Support**: Ensure logical reading order for assistive technologies

### 2. **Keyboard Navigation & Tab Order**
- **Sequential Focus**: CTA Button → Newsletter Email Input → Footer Social Links
- **Skip Links**: Verify logical tab progression through interactive elements
- **Focus Indicators**: Ensure visible focus states on all interactive elements
- **Keyboard Accessibility**: Full functionality available via keyboard navigation

### 3. **Dark Mode System Integration**
- **Class-based Toggle**: Verify dark mode works via CSS class addition/removal
- **Component Coordination**: Ensure all components respond to dark mode consistently
- **JSDOM Compatibility**: Test dark mode logic without full CSS rendering
- **State Management**: Verify dark mode state persists across component boundaries

### 4. **Newsletter Form Complete Flow**
- **Validation Integration**: Test invalid email → error state → `aria-invalid` attribute
- **Async Success Flow**: Test valid email → API call → success announcement
- **Error Handling**: Test API failure → graceful error display
- **Accessibility**: Verify `aria-live` announcements and form labeling

### 5. **Content Integration Verification**
- **Cross-Component Content**: Verify all expected text appears correctly
- **Media & Assets**: Ensure proper image alt text and media accessibility
- **Link Security**: Verify external links have `rel="noopener noreferrer"`
- **ARIA Landmarks**: Confirm proper landmark structure for navigation

## Implementation Strategy

### Test Architecture
```typescript
// Test-only composition component
function Landing({ onSubscribe = async () => {} }) {
  return (
    <div data-testid="landing-root">
      {/* All five components with realistic props */}
    </div>
  );
}
```

### Testing Tools & Libraries
- **@testing-library/react**: Component rendering and queries
- **@testing-library/user-event**: Realistic user interaction simulation
- **jest**: Test runner and assertion framework
- **@testing-library/jest-dom**: Extended DOM matchers

### Query Strategy
- **Role-based Queries**: Prefer `getByRole()` for semantic element identification
- **Accessible Names**: Use `name` option for specific element targeting
- **Avoid Snapshots**: Focus on behavior over implementation details
- **Label Queries**: Use `getByLabelText()` for form element associations

## Consequences

### Positive
- **Regression Prevention**: Catch integration issues before deployment
- **Accessibility Assurance**: Verify a11y compliance across component boundaries
- **User Experience Validation**: Ensure cohesive user interaction flows
- **Documentation**: Tests serve as behavioral documentation for the landing page
- **Confidence**: Developers can refactor with confidence in system stability

### Negative
- **Test Maintenance**: Integration tests require updates when component APIs change
- **Execution Time**: Integration tests are slower than unit tests
- **Complexity**: More complex test setup and mocking requirements
- **Brittleness Risk**: Tests may break due to unrelated changes

### Neutral
- **Coverage Overlap**: Some functionality is tested at both unit and integration levels
- **Mock Management**: Requires careful async function mocking for newsletter flow

## Test Coverage Areas

### Functional Testing
- ✅ Component composition and rendering
- ✅ User interaction flows (keyboard, mouse)
- ✅ Form validation and submission
- ✅ Async operation handling

### Accessibility Testing  
- ✅ Heading hierarchy and semantic structure
- ✅ Keyboard navigation and focus management
- ✅ ARIA attributes and announcements
- ✅ Screen reader compatibility

### Integration Testing
- ✅ Cross-component state management
- ✅ Dark mode system coordination
- ✅ Event handling across boundaries
- ✅ Layout and styling integration

## Alternatives Considered

1. **End-to-End Testing (Cypress/Playwright)**
   - **Rejected**: Too slow for CI, requires browser infrastructure
   - **Use Case**: Better for user journey testing across pages

2. **Component Testing in Isolation**
   - **Rejected**: Misses integration issues and cross-component interactions
   - **Use Case**: Already covered by existing unit tests

3. **Storybook Interaction Testing**
   - **Rejected**: Limited accessibility testing capabilities
   - **Use Case**: Good for visual regression, but not behavioral validation

4. **Snapshot Testing**
   - **Rejected**: Brittle and doesn't test actual functionality
   - **Use Case**: Useful for component API changes, but not behavior

## Success Metrics

- **Coverage**: Integration tests achieve >90% coverage of component interactions
- **Reliability**: <5% flaky test rate in CI environments
- **Performance**: Integration test suite completes in <30 seconds
- **Maintenance**: Test updates required for <50% of component changes

## Future Enhancements

- **Visual Regression**: Add Storybook visual regression testing
- **Performance Integration**: Test loading and rendering performance
- **Mobile Integration**: Add touch and mobile-specific interaction testing
- **Internationalization**: Test i18n prop integration across components
