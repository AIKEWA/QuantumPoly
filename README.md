# QuantumPoly - Futuristic Landing Page

A modern, cyberpunk-elegant landing page for QuantumPoly, built with Next.js 14+ and Tailwind CSS.

## Features

- 🌟 Cyberpunk-inspired design with elegant aesthetics
- 🚀 Built with Next.js 14+ using the App Router
- 🎨 Styled with Tailwind CSS for responsive design
- 🧩 Modular component architecture
- 📱 Fully responsive on all devices
- 🔍 SEO optimized

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AIKEWA/QuantumPoly.git
cd quantumpoly
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Available scripts:
```bash
npm run lint         # Run ESLint for code quality
npm run format       # Format code with Prettier
npm run build        # Build the project for production
npm run start        # Start the production server
npm run test         # Run unit tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run storybook    # Start Storybook development server
npm run build-storybook # Build Storybook for production
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

## Deployment

This project is optimized for deployment on Vercel:

```bash
npm run build
# or
vercel
```

## License

[MIT](LICENSE)

## Codebase Hygiene & Conventions

### Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
│   ├── ui/          # UI components (buttons, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
└── styles/          # Global styles and Tailwind config
```

### Coding Standards
- **TypeScript**: Strictly typed components and props
- **ESLint**: Configured with Next.js rules (`eslint.config.mjs`)
- **Prettier**: Code formatting (`.prettierrc.json`)
- **Tailwind CSS**: Utility-first styling
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation

### File Naming
- Components: PascalCase (e.g., `Hero.tsx`)
- Files: kebab-case (e.g., `layout.tsx`)
- Folders: kebab-case

### Commit Convention
- Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Keep commits atomic and descriptive

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run `npm run lint` and `npm run format`
4. Commit with descriptive message
5. Create pull request
6. Code review and merge

## Troubleshooting

### ESLint Configuration
- This project uses the modern ESLint flat config (`eslint.config.mjs`)
- If you encounter "Failed to load config" errors, ensure no legacy `.eslintrc.json` files exist in parent directories
- The config extends `next/core-web-vitals` for optimal Next.js development

### Build Issues
- Run `npm run build` to check for TypeScript and build errors
- Ensure all dependencies are installed with `npm install`
- Check that Node.js version is 16.8.0 or later

### Development Server
- Use `npm run dev` for development with hot reloading
- Server runs on `http://localhost:3000` by default
- Clear `.next` cache if you encounter persistent issues: `rm -rf .next`

## Internationalization (i18n)

QuantumPoly supports multiple languages using [next-intl](https://next-intl-docs.vercel.app/).

### Supported Languages

- **English (en)** - Default
- **German (de)** - Deutsch
- **Turkish (tr)** - Türkçe

### Using Translations in Components

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('hero');
  return <h1>{t('title')}</h1>;
}
```

### URL Structure

All routes are prefixed with the locale:
- `/en` - English
- `/de` - German  
- `/tr` - Turkish

### Locale Switching

Users can switch languages using the language selector in the footer. The selection is persisted via cookies and preserves the current page context.

### Adding New Languages

See the comprehensive [I18N Guide](./docs/I18N_GUIDE.md) for detailed instructions on adding new languages, translation keys, and testing patterns.

### Translation Files

Located in `src/locales/{locale}/`:
- `hero.json` - Hero section
- `about.json` - About section
- `vision.json` - Vision section
- `newsletter.json` - Newsletter form
- `footer.json` - Footer content
- `common.json` - Shared content (metadata, language names)

## Newsletter API Integration

QuantumPoly includes a production-ready Newsletter subscription API with modular backend integration.

### Features

- ✅ Zod-based email validation
- ✅ Dual-dimensional rate limiting (email + IP)
- ✅ i18n-ready error messages (6 locales)
- ✅ Extensible adapter pattern for any storage backend
- ✅ 98%+ test coverage with CI integration

### Quick Start

1. **In-Memory Mode (Development)**
   
   The API works out of the box with in-memory storage for prototyping.

2. **Supabase Integration (Production)**
   
   a. Set up environment variables:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_KEY="your_service_role_key"
   ```

   b. Create the database table:
   ```sql
   CREATE TABLE newsletter_subscribers (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     subscribed_at TIMESTAMPTZ DEFAULT now()
   );
   ```

   c. Implement the adapter (see `docs/NEWSLETTER_API.md` for full code)

### API Endpoint

- **Route**: `POST /api/newsletter`
- **Request**: `{ "email": "user@example.com" }`
- **Responses**: 201 (success), 400 (invalid), 409 (duplicate), 429 (rate limit), 500 (error)

### Documentation

For complete architecture details, adapter interface specifications, and Supabase integration guide, see:
- **[Newsletter API Documentation](./docs/NEWSLETTER_API.md)**
- **[API Testing Guide](./docs/API_TESTING_GUIDE.md)**
- **[Block 4.4 Implementation Summary](./BLOCK4.4_IMPLEMENTATION_SUMMARY.md)**

## Project Structure Details

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
│   ├── ui/          # UI components (buttons, etc.) - reserved
├── hooks/           # Custom React hooks - reserved
├── lib/             # Utility functions - reserved
├── locales/         # Translation files - prepared for i18n
└── styles/          # Global styles and Tailwind config
```

## Components: i18n, A11y, Theming & Testing

All QuantumPoly UI components are:
- ✅ Prop-driven (i18n-ready) — no hardcoded text
- ♿ Accessible — semantic HTML, ARIA where needed, visible focus
- 🎨 Themeable — Tailwind light/dark, AA contrast
- 🧪 Tested — Jest + Testing Library
- 📖 Documented — Storybook (default + dark) with controls

### Usage Example
```tsx
import Hero from "@/components/Hero";

<Hero
  title="Welcome"
  subtitle="QuantumPoly is leading the future"
  ctaLabel="Learn more"
/>;
```

### Props Overview

* **Hero**: `title`, `subtitle?`, `ctaLabel?`, `onCtaClick?`, `headingLevel?`, `className?`
* **About**: `title`, `body: ReactNode`, `headingLevel?`, `className?`
* **Vision**: `title`, `pillars: { title: string; description: string; icon?: ReactNode }[]`, `headingLevel?`, `className?`, `iconRenderer?`
* **NewsletterForm**: `title`, `description?`, `emailLabel`, `emailPlaceholder`, `submitLabel`, `successMessage`, `errorMessage`, `className?`, `onSubscribe?`, `validationRegex?`
* **Footer**: `brand`, `tagline?`, `copyright`, `socialLinks?: { label: string; href: string }[]`, `headingLevel?`, `className?`, `socialSlot?`

### Commands

* Tests: `npm run test`
* Storybook: `npm run storybook`

### Accessibility Features

All components include:
- **Semantic HTML** — proper heading hierarchy, landmark elements
- **ARIA Support** — labels, describedby relationships, live regions
- **Keyboard Navigation** — focusable elements, visible focus indicators
- **Screen Reader Support** — proper announcements, hidden decorative elements
- **External Link Security** — `rel="noopener noreferrer"` on external links

## Enterprise-Level Accessibility Design Decisions

### Live Region Pattern: `role="status"` vs `role="alert"`

**Design Decision**: Non-critical form feedback (validation errors, success messages) uses `role="status"` with `aria-live="polite"` by design. This is WCAG-compliant and intentional.

**Rationale**:
- `role="status"` with `aria-live="polite"` provides non-intrusive announcements
- Users maintain their current reading context while receiving feedback
- Keyboard flow remains unchanged (no focus trapping)
- `role="alert"` is reserved for truly critical errors requiring immediate attention

**When to Use `role="alert"`**:
- Security failures (authentication errors, permission denied)
- System failures (server unreachable, payment processing failure)
- Data loss warnings (unsaved changes, destructive actions)

### Heading Hierarchy & Landmark Strategy

**Single H1 Policy**: Each page maintains exactly one `<h1>` element (typically in Hero component) with all other sections using `<h2>` and properly nested `<h3>` elements.

**Landmark Labeling**: All major sections use `role="region"` with `aria-labelledby` pointing to their heading elements for proper screen reader navigation.

**Footer Semantics**: Footer uses `role="contentinfo"` for proper document structure and landmark navigation.

### Testing Coverage for Accessibility

- **Integration Tests**: Validate single H1 per page and proper landmark labeling
- **Component Tests**: Assert `aria-invalid`, `aria-describedby`, and live region behavior
- **Screen Reader Flow**: Test proper announcement patterns and navigation structure

### Testing Strategy

- **Unit Tests** — behavior testing via roles, labels, text (no snapshots)
- **Accessibility Testing** — proper ARIA attributes, keyboard navigation
- **Form Validation** — error states, success feedback, async handling
- **Component Variants** — multiple heading levels, with/without optional props

### Storybook Documentation

Each component includes:
- **Default Story** — realistic usage example
- **Dark Variant** — dark theme demonstration
- **Multiple Variants** — different configurations and use cases
- **Controls** — interactive prop editing
- **Documentation** — usage notes and accessibility guidelines

## Storybook—How we write stories

Our Storybook follows Component Story Format 3 (CSF3) with TypeScript integration and accessibility-first design. All stories must include proper accessibility testing and realistic usage examples.

### Story Template

```typescript
// Example.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    a11y: { disable: false },
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Visual variant of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
};

export const WithInteraction: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test accessibility and interactions
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    
    await expect(button).toHaveFocus();
  },
};
```

### Required Story Types
- **Default**: Most common usage scenario
- **All Variants**: Cover all prop combinations
- **Interactive States**: Hover, focus, active with play functions
- **Error/Edge Cases**: Error states, loading states, disabled states
- **Accessibility Examples**: Screen reader scenarios, keyboard navigation

### Guidelines Document
For complete guidelines, see [Storybook Hygiene Guidelines](./docs/STORYBOOK_HYGIENE_GUIDELINES.md).


<!-- PROPS:START -->
## Component Props

### Hero

| Prop           | Type         | Default | Required | Description                                                                  |
| -------------- | ------------ | ------- | -------- | ---------------------------------------------------------------------------- |
| `title`        | `string`     | —       | Yes      | Main heading text                                                            |
| `subtitle`     | `string`     | —       | No       | Optional subtitle displayed below the title                                  |
| `ctaLabel`     | `string`     | —       | No       | Label for the call-to-action button                                          |
| `onCtaClick`   | `() => void` | —       | No       | Click handler for the CTA button                                             |
| `headingLevel` | `enum`       | `2`     | No       | Provide a custom HTML heading level (1-6). Defaults to 2.                    |
| `media`        | `ReactNode`  | —       | No       | Optional background or immersive media element rendered beneath text         |
| `className`    | `string`     | —       | No       | Additional Tailwind or CSS classes to apply to the component’s root element. |
### About

| Prop           | Type        | Default | Required | Description |
| -------------- | ----------- | ------- | -------- | ----------- |
| `title`        | `string`    | —       | Yes      | —           |
| `body`         | `ReactNode` | —       | Yes      | —           |
| `headingLevel` | `enum`      | `2`     | No       | —           |
| `className`    | `string`    | —       | No       | —           |
### Vision

| Prop           | Type                                            | Default | Required | Description                            |
| -------------- | ----------------------------------------------- | ------- | -------- | -------------------------------------- |
| `title`        | `string`                                        | —       | Yes      | —                                      |
| `pillars`      | `Pillar[]`                                      | —       | Yes      | —                                      |
| `headingLevel` | `enum`                                          | `2`     | No       | —                                      |
| `className`    | `string`                                        | —       | No       | —                                      |
| `iconRenderer` | `(icon: ReactNode, title: string) => ReactNode` | —       | No       | Optional custom icon renderer function |
### Footer

| Prop           | Type           | Default | Required | Description                                         |
| -------------- | -------------- | ------- | -------- | --------------------------------------------------- |
| `brand`        | `string`       | —       | Yes      | Brand or site title                                 |
| `tagline`      | `string`       | —       | No       | Optional tagline displayed beneath the brand        |
| `copyright`    | `string`       | —       | Yes      | Copyright notice (already localised)                |
| `socialLinks`  | `SocialLink[]` | —       | No       | Optional array of social links                      |
| `headingLevel` | `enum`         | `2`     | No       | Heading level for the brand element (defaults to 2) |
| `className`    | `string`       | —       | No       | Tailwind utility class extension                    |
| `socialSlot`   | `ReactNode`    | —       | No       | Slot to completely override the social links layout |
### NewsletterForm

| Prop               | Type                               | Default | Required | Description                                                                           |
| ------------------ | ---------------------------------- | ------- | -------- | ------------------------------------------------------------------------------------- |
| `title`            | `string`                           | —       | Yes      | Heading text displayed above the form                                                 |
| `description`      | `string`                           | —       | No       | Optional description displayed under the title                                        |
| `emailLabel`       | `string`                           | —       | Yes      | Label text for the email input                                                        |
| `emailPlaceholder` | `string`                           | —       | Yes      | Placeholder for the email input                                                       |
| `submitLabel`      | `string`                           | —       | Yes      | Label for the submit button                                                           |
| `successMessage`   | `string`                           | —       | Yes      | Message announced on successful subscription                                          |
| `errorMessage`     | `string`                           | —       | Yes      | Message announced when submission fails                                               |
| `onSubscribe`      | `(email: string) => Promise<void>` | —       | No       | Optional external submit handler. Receives the email string and should resolve/reject |
| `className`        | `string`                           | —       | No       | Extra className for root section                                                      |
| `validationRegex`  | `RegExp`                           | —       | No       | Optional custom email validation regex pattern                                        |

<!-- PROPS:END -->
