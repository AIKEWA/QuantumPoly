# QuantumPoly Accessibility Guide

## Overview

This guide provides comprehensive accessibility standards and implementation patterns for the QuantumPoly project. All components and features must meet WCAG 2.1 AA standards with automated enforcement via our CI/CD pipeline.

## Automated Quality Gates

### Lighthouse CI Requirements
- **Accessibility Score: 1.0** (Required - failures block deployment)
- **Performance Score: ≥ 0.9** (Warning threshold)
- **SEO Score: ≥ 0.9** (Warning threshold)

### Storybook A11y Testing
- All components automatically tested via `@storybook/addon-a11y`
- Visual accessibility feedback in Storybook interface
- Automated test execution in CI pipeline

## Core Accessibility Principles

### 1. Semantic HTML
```tsx
// ✅ Good: Semantic structure
<article>
  <header>
    <h1>Article Title</h1>
  </header>
  <main>
    <p>Article content...</p>
  </main>
</article>

// ❌ Avoid: Generic divs for semantic content
<div>
  <div>Article Title</div>
  <div>Article content...</div>
</div>
```

### 2. ARIA Labels and Descriptions
```tsx
// ✅ Good: Proper ARIA usage
<button 
  aria-label="Close modal dialog"
  aria-describedby="modal-description"
  onClick={closeModal}
>
  ×
</button>
<div id="modal-description" className="sr-only">
  This will close the modal and return you to the main page
</div>

// ❌ Avoid: Unclear button purpose
<button onClick={closeModal}>×</button>
```

### 3. Keyboard Navigation
```tsx
// ✅ Good: Keyboard accessible component
const NavigableComponent = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleAction();
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleAction}
      aria-label="Perform action"
    >
      Action Element
    </div>
  );
};
```

### 4. Color and Contrast
```css
/* ✅ Good: High contrast ratios */
.text-primary {
  color: #1a1a1a; /* 13.4:1 contrast on white */
}

.text-secondary {
  color: #4a4a4a; /* 7.5:1 contrast on white */
}

/* ❌ Avoid: Low contrast */
.text-light-gray {
  color: #999999; /* 2.8:1 contrast - fails WCAG AA */
}
```

## Component Accessibility Patterns

### Form Controls
```tsx
// ✅ Complete accessible form
const AccessibleForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <form>
      <div>
        <label htmlFor="email-input">
          Email Address *
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error && (
          <div id="email-error" role="alert" className="error">
            {error}
          </div>
        )}
      </div>
    </form>
  );
};
```

### Modal Dialogs
```tsx
// ✅ Accessible modal with focus management
const AccessibleModal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleEscape}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};
```

## Testing and Validation

### Local Development
```bash
# Run Storybook with a11y addon
npm run storybook

# Run Storybook a11y tests
npm run storybook:test

# Build and test locally with Lighthouse
npm run build
npx lhci autorun --collect.url="http://localhost:3000"
```

### CI/CD Integration
- **Preview Deployment**: Lighthouse CI runs against live preview URLs
- **Component Testing**: Storybook a11y tests run on every build
- **Quality Gates**: Accessibility score of 1.0 required for deployment

### Browser Testing Tools
1. **axe DevTools**: Browser extension for accessibility auditing
2. **WAVE**: Web accessibility evaluation tool
3. **Screen Reader Testing**: 
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS)
   - Orca (Linux)

## Common Issues and Solutions

### Issue: Missing Form Labels
```tsx
// ❌ Problem
<input type="text" placeholder="Enter your name" />

// ✅ Solution
<label htmlFor="name-input">Full Name</label>
<input 
  id="name-input" 
  type="text" 
  placeholder="Enter your name" 
/>
```

### Issue: Non-descriptive Link Text
```tsx
// ❌ Problem
<a href="/docs">Click here</a>

// ✅ Solution
<a href="/docs">Read the documentation</a>
// or
<a href="/docs" aria-label="Read the QuantumPoly documentation">
  Click here
</a>
```

### Issue: Missing Skip Links
```tsx
// ✅ Solution: Add skip navigation
const Layout = ({ children }) => (
  <>
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <nav>
      {/* Navigation items */}
    </nav>
    <main id="main-content">
      {children}
    </main>
  </>
);
```

## Performance Considerations

### Accessibility and Performance Balance
- **Image Alt Text**: Essential for screen readers, minimal performance impact
- **ARIA Labels**: Improve accessibility without affecting load times
- **Focus Management**: JavaScript-based, runs after initial page load
- **Semantic HTML**: Better accessibility AND SEO performance

### Optimization Strategies
```tsx
// ✅ Efficient accessible component
const OptimizedAccessibleButton = memo(({ 
  children, 
  ariaLabel, 
  onClick 
}) => (
  <button
    className="btn-primary"
    aria-label={ariaLabel}
    onClick={onClick}
  >
    {children}
  </button>
));
```

## Resources and Support

### Internal Resources
- [ADR-004: Lighthouse & A11y CI](./adr/ADR-004-lighthouse-a11y.md)
- Storybook accessibility addon documentation
- Component accessibility test patterns

### External Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility Documentation](https://reactjs.org/docs/accessibility.html)
- [Next.js Accessibility Features](https://nextjs.org/docs/accessibility)

### Getting Help
- **Accessibility Issues**: Create GitHub issue with `accessibility` label
- **CI/CD Problems**: Contact DevOps team with Lighthouse CI logs
- **Component Questions**: Refer to Storybook documentation and examples
- **Training Requests**: Schedule accessibility workshop sessions
