## i18n & Logger Conventions

### i18n
- Canonical module: `src/i18n/index.ts`.
- Add new locales by adding `messages/<locale>.json` and calling `i18n.loadLocale(locale, dict)` at startup if needed.
- Missing key policy:
  - Development: warns in console with call stack.
  - Production: throws to fail build/tests.
- Usage example:
```ts
import { i18n } from '@/i18n';
i18n.setLocale('de');
i18n.t('welcome.title', { name: 'Aykut' });
```

### Logger
- Import from `src/utils/logger.ts`.
- Quickstart:
```ts
import { info, withErrorLogging, timeStart } from '@/utils/logger';
const stop = timeStart('loadDashboard');
// ... work ...
stop(); // logs elapsed
const safe = withErrorLogging(doRiskyThing, 'RiskyThing');
safe();
```
- Config overrides, persistence key, and clearing logs:
```ts
import { updateConfig, clearStoredLogs } from '@/utils/logger';
updateConfig({ localStorageKey: 'app.logs', debounceMs: 250 });
clearStoredLogs();
```

### QA Checklist (manual)
- Change locale via UI → strings update instantly; no console missing-key warnings.
- Force a missing key → expected dev warning appears.
- Trigger 200+ logs quickly → app stays responsive; logs persist after refresh.
- Simulate SSR route render → no window references crash the build.
- Wrap a throwing function with `withErrorLogging` → error recorded & rethrown.

# QuantumPoly - Modular UI Excellence

A Next.js application showcasing modular, accessible, and internationalized React components built with comprehensive testing and documentation.

## 🚀 Features

### **Modular Excellence**

- ✅ **5 Core Components**: Hero, About, Vision, Newsletter, Footer
- ✅ **Reusable Architecture**: Props-based content for internationalization
- ✅ **TypeScript Interfaces**: Complete type safety and IntelliSense support
- ✅ **Component Composition**: Flexible and extensible design patterns

### **Accessibility First**

- ✅ **WCAG 2.1 Compliant**: Semantic HTML and ARIA attributes
- ✅ **Keyboard Navigation**: Full keyboard accessibility support
- ✅ **Screen Reader Optimized**: Proper landmarks and descriptions
- ✅ **Focus Management**: Logical tab order and visual indicators
- ✅ **High Contrast**: Meets accessibility color contrast requirements

### **Responsive Design**

- ✅ **Mobile-First**: Progressive enhancement approach
- ✅ **Breakpoint System**: sm, md, lg, xl, 2xl responsive design
- ✅ **Flexible Layouts**: CSS Grid and Flexbox implementations
- ✅ **Touch-Friendly**: Optimized for touch interfaces

### **Theme Support**

- ✅ **Dark/Light Mode**: Complete theme system via Tailwind CSS
- ✅ **System Preference**: Respects user's OS theme preference
- ✅ **Smooth Transitions**: Animated theme switching
- ✅ **Consistent Colors**: Unified color palette across themes

### **Internationalization Ready**

- ✅ **Props-Based Content**: All text content via component props
- ✅ **Locale Support**: Ready for i18n integration
- ✅ **RTL Support**: Right-to-left language compatibility
- ✅ **Cultural Adaptation**: Number, date, and currency formatting

### **Testing & Quality**

- ✅ **Unit Tests**: Comprehensive Jest + React Testing Library
- ✅ **Accessibility Tests**: Automated a11y testing integration
- ✅ **Coverage Reports**: Test coverage tracking and reporting
- ✅ **Type Safety**: Full TypeScript coverage

### **Documentation & Development**

- ✅ **Storybook Integration**: Interactive component documentation
- ✅ **Design System**: Visual component library and variants
- ✅ **API Documentation**: JSDoc comments and TypeScript interfaces
- ✅ **Development Tools**: ESLint, Prettier, and dev server setup

## 📁 Project Structure

```
QuantumPoly/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   └── page.tsx            # Main home page
│   ├── components/
│   │   ├── Hero.tsx            # Hero section with CTA
│   │   ├── Hero.stories.tsx    # Storybook stories
│   │   ├── About.tsx           # About section with content
│   │   ├── About.stories.tsx   # Storybook stories
│   │   ├── Vision.tsx          # Vision pillars display
│   │   ├── Vision.stories.tsx  # Storybook stories
│   │   ├── Newsletter.tsx      # Newsletter signup form
│   │   ├── Newsletter.stories.tsx # Storybook stories
│   │   ├── Footer.tsx          # Site footer with links
│   │   └── Footer.stories.tsx  # Storybook stories
│   ├── types/
│   │   └── components.ts       # TypeScript interfaces
│   ├── styles/
│   │   └── globals.css         # Global styles and Tailwind
│   └── utils/
│       ├── constants.ts        # App constants
│       └── logger.ts           # Logging utilities
├── __tests__/
│   └── components/
│       ├── Hero.test.tsx       # Hero component tests
│       ├── About.test.tsx      # About component tests
│       ├── Vision.test.tsx     # Vision component tests
│       ├── Newsletter.test.tsx # Newsletter component tests
│       └── Footer.test.tsx     # Footer component tests
├── .storybook/
│   ├── main.ts                 # Storybook configuration
│   └── preview.ts              # Global story settings
├── docs/
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   └── MAINTENANCE_GUIDE.md    # Maintenance documentation
└── public/                     # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/quantumpoly/quantumpoly.git
cd quantumpoly

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run Jest unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Documentation
npm run storybook       # Start Storybook dev server
npm run build-storybook # Build Storybook for deployment

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler
```

## 🧩 Component Architecture

### Component Structure

Each component follows a consistent pattern:

```typescript
// Component interface definition
interface ComponentProps extends BaseComponentProps {
  title: string;
  content: string[];
  // ... specific props
}

// Component implementation
export default function Component({
  title = "Default Title",
  content = [],
  className = "",
  id = "component-id",
  ...props
}: ComponentProps) {
  // Component logic
  return (
    <section
      id={id}
      className={`base-styles ${className}`}
      aria-labelledby={`${id}-heading`}
      {...props}
    >
      {/* Component content */}
    </section>
  );
}
```

### Key Features

#### **Props-Based Internationalization**

```typescript
// English
<Hero
  title="QuantumPoly"
  subtitle="Merging AI with Sustainable Innovation"
  ctaText="Join the Future"
/>

// Spanish
<Hero
  title="QuantumPoly"
  subtitle="Fusionando IA con Innovación Sostenible"
  ctaText="Únete al Futuro"
/>
```

#### **Accessibility Implementation**

```typescript
// Semantic HTML structure
<section role="region" aria-labelledby="section-heading">
  <h2 id="section-heading" tabIndex={0}>Title</h2>
  <div aria-describedby="section-description">
    {/* Content */}
  </div>
</section>
```

#### **Theme-Aware Styling**

```css
/* Tailwind classes with theme support */
.component {
  @apply bg-gray-50 dark:bg-gray-900;
  @apply text-gray-900 dark:text-gray-100;
  @apply transition-colors duration-300;
}
```

## 🧪 Testing Strategy

### Unit Testing

- **Framework**: Jest + React Testing Library
- **Coverage**: 90%+ target coverage
- **Focus Areas**: Accessibility, interactions, edge cases

### Test Structure

```typescript
describe('Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {});
    it('renders with custom props', () => {});
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {});
    it('supports keyboard navigation', () => {});
  });

  describe('Interactions', () => {
    it('handles user interactions', () => {});
  });
});
```

### Accessibility Testing

- **Automated**: Storybook a11y addon
- **Manual**: Keyboard navigation testing
- **Screen Reader**: NVDA/JAWS compatibility testing

## 📚 Storybook Documentation

### Story Structure

Each component includes comprehensive stories:

- **Default**: Basic component with default props
- **Custom Content**: Demonstrates props customization
- **Multilingual**: Internationalization examples
- **Dark Theme**: Theme switching demonstration
- **Accessibility Demo**: Accessibility feature showcase
- **Responsive**: Mobile/tablet/desktop variants
- **Interactive**: User interaction demonstrations

### Viewing Documentation

```bash
npm run storybook
```

Access Storybook at [http://localhost:6006](http://localhost:6006)

## 📘 Storybook v9 Setup (Next.js)

This repository is already configured for Storybook v9 with Next.js.

### Install (if setting up from scratch)

```bash
npm i -D storybook @storybook/nextjs @storybook/react @storybook/addon-links @storybook/addon-docs @storybook/test
```

### Scripts

```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

### Configuration

- `/.storybook/main.ts` — uses `@storybook/nextjs` framework and enables autodocs:
  - `stories`: `src/**/*.stories.@(js|jsx|ts|tsx|mdx)`
  - `addons`: `@storybook/addon-docs`, `@storybook/addon-links`
  - `docs.autodocs: 'tag'`
  - `staticDirs: ['public']`
- `/.storybook/preview.tsx` — global parameters and decorators:
  - Loads `src/styles/globals.css`
  - Configures actions, controls, backgrounds, viewport, a11y and docs
  - Wraps stories in a layout container for light/dark background testing

### Writing Stories

- Place stories alongside components, e.g. `src/components/Hero.stories.tsx`.
- Supported names: `*.stories.tsx` or `*.story.tsx`.
- Add the `autodocs` tag on stories or rely on project-level `tags: ['autodocs']`.

### Troubleshooting

- Node 18+ is required.
- If you encounter peer dependency warnings/errors:
  1) Remove `node_modules` and lockfile, 2) `npm install` again.
- Ensure all Storybook packages are on the same major/minor version (v9.x).

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--cyan-400: #22d3ee; /* Primary accent */
--cyan-500: #06b6d4; /* Primary main */
--purple-500: #a855f7; /* Secondary accent */

/* Theme Colors */
--gray-50: #f9fafb; /* Light background */
--gray-900: #111827; /* Dark background */
```

### Typography Scale

```css
/* Heading Hierarchy */
h1: text-6xl md:text-8xl   /* Hero titles */
h2: text-3xl md:text-4xl   /* Section headings */
h3: text-xl md:text-2xl    /* Subsection headings */

/* Body Text */
body: text-base md:text-lg  /* Regular content */
small: text-sm             /* Secondary content */
```

### Spacing System

```css
/* Consistent spacing using Tailwind scale */
--space-xs: 0.25rem; /* 4px */
--space-sm: 0.5rem; /* 8px */
--space-md: 1rem; /* 16px */
--space-lg: 1.5rem; /* 24px */
--space-xl: 3rem; /* 48px */
```

## 🔧 Configuration

### Tailwind CSS

Custom configuration for the project's design system:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      fontFamily: {
        // Custom fonts
      },
    },
  },
};
```

### Next.js Configuration

Optimized for performance and SEO:

```javascript
// next.config.mjs
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
};
```

### Build & Lint Policy

- Only define event handlers in client components. In the App Router, do not pass functions from server components to client components.
- Storybook story files are excluded from TypeScript project references and ESLint typed linting.
  - `tsconfig.json` excludes: `**/*.stories.ts(x)`
  - `eslint.config.mjs` ignores: `.storybook/**` and `src/**/*.stories.*`
- Lint is enforced locally and ignored during production builds for faster/safer deploys.
  - Local: `npm run lint`
  - Build: `next.config.mjs` sets `eslint.ignoreDuringBuilds: true`
  - To re-enable ESLint in builds later, set `ignoreDuringBuilds` to `false`.

### Optional CI Checks

You can add a CI workflow to run `npm run lint` and `npm run test` separately from Vercel. A sample workflow is provided under `.github/workflows/ci.yml` and is configured for manual runs. Enable pull request triggers when ready.

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# Test production build locally
npm run start
```

### Deployment Platforms

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative static hosting
- **AWS Amplify**: Enterprise cloud deployment

### Performance Optimization

- ✅ **Code Splitting**: Automatic route-based splitting
- ✅ **Image Optimization**: Next.js Image component
- ✅ **Bundle Analysis**: webpack-bundle-analyzer integration
- ✅ **Lighthouse Scores**: 90+ performance targeting

## 🤝 Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Run quality checks
5. Submit pull request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for React and accessibility
- **Prettier**: Consistent code formatting
- **Testing**: Required for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the excellent React framework
- **Next.js Team**: For the powerful Next.js framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Storybook Team**: For the component development environment
- **Testing Library**: For accessible testing utilities
- **Community Contributors**: For valuable feedback and contributions

## Codebase Hygiene & Conventions

- **Router**: App
- **Structure**: `src/components`, `src/styles`, `src/locales`
- **Lint/Format**:
  - ESLint: `npm run lint` (extends `next/core-web-vitals`)
  - Prettier: `npm run format`
- **Styles**: Tailwind (single global entry), no duplicate globals
- **i18n**: Locale files under `src/locales` (see docs/INTERNATIONALIZATION.md for details since already implemented)

---

**QuantumPoly** - Building the future of modular, accessible, and maintainable UI components.

For more information, visit our [documentation](https://quantumpoly.dev/docs) or join our [Discord community](https://discord.gg/quantumpoly).

## Internationalization Documentation

**Add a new language (e.g., `es`)**

1. Add code `locales.push('es')` and extend `Locale` type.
2. Create `/locales/es.json` by copying `en.json` keys.
3. Provide translations.
4. (App Router) Ensure `[locale]` routes include `es` in `generateStaticParams`.
5. Verify `/es` builds and the switcher lists Español.

### Add a string

1. Choose a namespace (e.g., `hero`, `about`, `vision`, `newsletter`, `footer`, `language`).
2. Add the key with the same structure to all locale files under `src/locales`.
3. Consume with `useTranslations('<namespace>')('key')` or via props where supported.
4. For interpolation, add placeholders like `{name}` and pass values.

### Routing notes

- Default locale redirect: `/` redirects to `/${defaultLocale}` (currently `en`).
- Deep path preservation: switching locale preserves the current path and query/hash.
- Middleware-driven locale routing is enabled via `next-intl/middleware` in `src/middleware.ts`.
- Locale prefixes are added "as-needed" (no prefix for default locale).

**Add a new string**

1. Choose a namespace (component or feature).
2. Add the key to **all** locale files with the same structure.
3. Consume with `useTranslations('<namespace>')('key')`.
4. If the string needs interpolation, add placeholders like `{{name}}` and pass values.

**Routing notes**

* Default locale: `/` redirects to `/${defaultLocale}`.
* Deep links preserve the path: `/en/vision` ↔ `/de/vision`.
