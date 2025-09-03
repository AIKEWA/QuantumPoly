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

The project is prepared for internationalization with the `src/locales/` directory structure. Future implementation will support multiple languages for global accessibility.

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
