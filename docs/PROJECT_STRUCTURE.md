# QuantumPoly Project Structure

## Current Structure

```
quantumpoly/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── [locale]/   # i18n route groups
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── messages/       # i18n translation files
│   ├── middleware.ts   # Monolithic middleware (284 lines)
│   ├── stores/         # Global state management
│   ├── styles/         # Global CSS files
│   └── utils/          # Utility functions
│       ├── debugLogging.ts
│       ├── localeDetection.ts
│       ├── middlewareDebugOverlay.ts
│       ├── middlewareMatcherFactory.ts
│       ├── middlewareMatcherVisualizer.ts
│       ├── redirectTracker.ts
│       ├── redirectTester.ts
│       └── resetI18nCookies.ts
├── next.config.js      # Next.js configuration
└── ...                 # Other config files
```

## Proposed Refactored Structure

```
quantumpoly/
├── public/
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── [locale]/   # i18n route groups
│   ├── components/
│   ├── hooks/
│   ├── messages/
│   ├── middleware/     # Modularized middleware
│   │   ├── index.ts    # Main middleware entry point (slim)
│   │   ├── config.ts   # Static configuration
│   │   ├── modules/    # Middleware modules
│   │   │   ├── localeHandler.ts
│   │   │   ├── redirectLogic.ts
│   │   │   ├── browserCompat.ts
│   │   │   └── safetyNet.ts
│   │   └── utils/      # Middleware-specific utilities
│   │       ├── debugTools.ts
│   │       ├── loopDetection.ts
│   │       └── requestParser.ts
│   ├── stores/
│   ├── styles/
│   └── utils/          # Application-wide utilities
│       ├── i18n/       # i18n utilities
│       ├── dev/        # Development tools
│       │   ├── visualizer.ts
│       │   └── tester.ts
│       └── common/     # Shared utilities
└── ...                 # Config files
```

## Key Improvements

1. **Clear Organization**:
   - Dedicated middleware directory with focused modules
   - Separation of core middleware logic from utilities
   - Logical grouping of related functionality

2. **Modularity**:
   - Each middleware module has a single responsibility
   - Clear entry point with delegated processing
   - Configuration separated from implementation

3. **Maintainability**:
   - Smaller files are easier to understand and maintain
   - Related code is grouped together
   - Clear boundaries between different concerns

4. **Extensibility**:
   - New modules can be added without changing existing code
   - Development tools are separated from production code
   - Configuration can be modified independently

## Migration Plan

1. Create the new directory structure
2. Extract the configuration into `middleware/config.ts`
3. Split the monolithic middleware into modules
4. Update imports and ensure everything works together
5. Add tests for each module
6. Verify behavior is unchanged

This structure will enable developers to understand, maintain, and extend the middleware system while preserving its complex logic and self-protecting capabilities. 