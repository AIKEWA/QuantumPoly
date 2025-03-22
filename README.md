# QuantumPoly

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/github/license/quantumpoly/quantumpoly)](LICENSE)

QuantumPoly is a modern, multilingual, and accessible web platform that merges artificial intelligence with sustainable innovation and metaverse futures.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, React 18, TypeScript
- **Responsive Design**: Mobile-first interface with TailwindCSS
- **Internationalization**: Support for English, German, and Turkish
- **Self-Defending Middleware**: Intelligent redirect handling with loop detection
- **Dark/Light Mode**: System-aware theme with manual toggle
- **GDPR Compliance**: Cookie consent banner and privacy policy pages
- **SEO Optimized**: Metadata, Open Graph, and proper semantic HTML
- **Analytics**: Integration with Vercel Analytics
- **Testing**: Jest and React Testing Library setup
- **Intent Audit Tools**: Analyze your code for meaningful purpose beyond technical correctness

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quantumpoly.git
cd quantumpoly

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## 📚 Project Structure

```
quantumpoly/
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── [locale]/      # i18n route groups
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── messages/          # i18n translation files
│   ├── middleware/        # Modular middleware system
│   │   ├── index.ts       # Main middleware entry point
│   │   ├── config.ts      # Static configuration
│   │   ├── modules/       # Middleware modules
│   │   └── utils/         # Middleware-specific utilities
│   ├── stores/            # Global state management
│   ├── styles/            # Global CSS files
│   └── utils/             # Application-wide utilities
├── docs/                  # Project documentation
├── tests/                 # Test files
├── jest.config.js         # Jest configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🌐 Internationalization

The application supports the following languages:

- English (default)
- German
- Turkish

Language detection follows this priority:

1. URL path locale segment (e.g., `/en/about`)
2. User's previously selected language (stored in cookies)
3. Browser's preferred language
4. Default to English

Users can manually change the language using the language selector in the site header.

## 🧠 Middleware Architecture

QuantumPoly features a sophisticated middleware system that handles internationalization with a focus on preventing redirect loops and optimizing browser compatibility.

### Key Features

- **Static Configuration**: Uses explicit static patterns for predictable behavior
- **Early Exit Conditions**: Multiple safeguards to break redirect loops
- **Short-lived Cookies**: Minimal cookie lifetimes for redirect tracking
- **Single Source of Truth**: Consolidated middleware into a unified system

### Middleware Components

#### 1. Configuration (`middleware/config.ts`)

- Static matcher patterns without dynamic expressions
- Centralized cookie settings and safety thresholds
- Path exclusion definitions

#### 2. Core Logic (`middleware/index.ts`) 

- Implements the main middleware processing flow
- Contains clear exit conditions and decision points
- Handles locale detection and redirection

### Middleware Flow

1. **Locale Check**: If path already has a valid locale prefix, skip redirect
2. **Skip Conditions**: Check for special parameters or cookies that indicate redirection should be skipped
3. **Path Filtering**: Exclude API routes, static files, and internal Next.js paths
4. **Loop Detection**: Analyze redirect history to detect and break potential loops
5. **Locale Detection**: Choose appropriate locale based on user preferences
6. **Safe Redirect**: Perform redirection with short-lived tracking cookies

### Cookie Management

| Cookie Name | Purpose | Lifetime | When Cleared |
|-------------|---------|----------|------------|
| `just-redirected` | Prevents consecutive redirects | 1 second | After next request |
| `redirect-history` | Tracks redirect patterns | 60 seconds | When reaching valid locale path |
| `NEXT_LOCALE` | Stores user locale preference | 30 days | Not automatically cleared |

For more detailed documentation of the middleware system, see [src/middleware/README.md](src/middleware/README.md).

## 🧪 Testing

```bash
# Run tests
npm run test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Run middleware tests specifically
npm run test:middleware
```

## 🔍 Development Tools

### Intent Audit Tools

QuantumPoly includes a set of tools for analyzing the "intent" of your codebase beyond mere technical correctness. These tools help identify areas where code might be working correctly but failing to express meaningful purpose.

#### Intent Audit CLI

Scan your codebase for patterns of "silent failure" - components and functions that work technically but may lack clear purpose:

```bash
npm run intent-audit
```

The tool detects:
- Empty component returns without explanation
- Exception catching without handling
- Unimplemented placeholder functions
- Missing page components in route directories
- And other patterns of "correct but meaningless" code

#### Intent Visualization

Generate an interactive visualization of your component architecture and potential silent failures:

```bash
npm run visualize-intent
```

This creates an HTML file with:
- A network graph of component relationships
- Color-coding for component types (pages, layouts, components)
- Highlighting of components with potential silent failures
- Detailed information about the "intent health" of your system

For more information about the Intent Audit philosophy, see [docs/the-silence-of-systems.md](docs/the-silence-of-systems.md) and [docs/intent-audit.md](docs/intent-audit.md).

### Middleware Visualizer

QuantumPoly includes a visual debugging tool for middleware behavior in development mode. When running in development, the middleware injects a debug overlay showing:

- Current locale
- Redirect history
- Loop detection status
- Processing time

Access the debug overlay by running the dev server and checking any redirect:

```bash
npm run dev
```

Then look for the debug overlay in the bottom right corner of your browser.

### Redirect Tester

Test various redirect scenarios using the built-in testing tool:

```bash
npm run test:redirects
```

This will simulate different browser conditions and verify the middleware's self-defense mechanisms.

## 📦 Deployment

The project is configured for deployment on Vercel, but can be deployed on any platform that supports Next.js.

### Deployment Checklist

- ✅ Verify locale redirects work correctly
- ✅ Test with Safari, Chrome, Firefox, and Edge
- ✅ Ensure all environment variables are set
- ✅ Run `npm run build` to verify build success

### Environment Variables

- `NEXT_PUBLIC_ANALYTICS_ID`: Vercel Analytics ID (optional)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Jest](https://jestjs.io/)
- [Vercel](https://vercel.com/)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Architecture Overview

This project uses Next.js 14 with the App Router and internationalization through next-intl middleware. The application follows a localized routing structure with dynamic content loading.

### Key Features:

- Locale-based routing (`/[locale]/...`)
- Dynamic component loading with Suspense
- Dark mode support with Tailwind CSS
- Internationalization with messages in multiple languages
- Custom middleware for locale detection and redirection

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the following settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
   - Environment Variables: (Add any required env variables)

3. Domain Configuration:
   - Add your custom domain: `quantumpoly.ai`
   - Set up DNS records:
     - Type: A, Name: @, Value: 76.76.21.21
     - Type: CNAME, Name: www, Value: cname.vercel-dns.com

4. Deploy:
   - Push changes to GitHub to trigger automatic deployment
   - Or manually deploy from the Vercel dashboard

## Intent Audit Tool

This project includes a custom intent-audit tool to check for "silent successes" in the codebase:

```bash
# Run the intent audit
npm run intent-audit
```

The tool checks for:
- Routes with missing or empty page components
- Unused internationalization message keys
- Visual mapping of application intent

## License

Copyright © 2023 QuantumPoly. All rights reserved.
