# The Illusion of Dynamism: Lessons from the Edge Middleware Redirect Loop

## Overview

Our Next.js application was experiencing an infinite redirect loop in the Edge Middleware, despite the matcher configuration appearing to be correctly generated. This document details the investigation, solution, and key insights regarding Next.js middleware constraints and static export requirements.

## The Problem

The application's middleware was designed to handle internationalization by redirecting requests without a locale prefix to the appropriate locale path. However, despite a seemingly valid configuration, the middleware was intercepting routes that already had locale prefixes, resulting in an infinite redirect loop.

### Symptoms

1. Requests to `/en/dashboard` were intercepted by middleware, despite the `/en` prefix
2. Each request triggered a new redirect, creating an infinite loop
3. The loop persisted despite correct-looking matcher patterns in `generatedMatcher.ts`

## Root Cause Analysis

The fundamental issue stemmed from a misunderstanding of how Next.js processes the `export const config` in Edge Middleware:

1. **Static Analysis Requirement**: Next.js analyzes middleware configuration at **build time**, not runtime
2. **Dynamic Import Failure**: Our configuration was imported from a dynamically generated file:
   ```typescript
   import { middlewareMatcherConfig } from './utils/generatedMatcher';
   export const config = middlewareMatcherConfig;
   ```
3. **Invisible to Next.js**: This dynamic import prevented Next.js from statically analyzing the actual matcher patterns

Despite our CI process correctly generating the matcher patterns in `generatedMatcher.ts`, Next.js was unable to "see" these patterns during its static analysis phase, resulting in the middleware running for all paths, including those that already had locale prefixes.

## The Solution

We implemented a three-part solution to resolve the issue:

1. **Static Inline Configuration**: Replace the dynamic import with static literals directly in `middleware.ts`:
   ```typescript
   export const config = {
     matcher: [
       '/((?!api|_next|.*\\..*).*)' ,
       '/((?!en|de|tr).*)',
       '/'
     ]
   };
   ```

2. **Automated Updates**: Created a Node.js script that:
   - Parses locales from `i18n.ts`
   - Generates the appropriate matcher patterns
   - Updates `middleware.ts` with inline static configuration
   - Runs as part of the build process

3. **CI Integration**: Added a GitHub workflow that automatically updates the middleware configuration when `i18n.ts` changes

4. **Verification Test**: Created a test to ensure middleware configuration remains statically analyzable

## Key Insights

1. **Build-time vs. Runtime**: Next.js Edge Middleware configuration is analyzed at build time, not dynamically at runtime

2. **Static Export Requirements**: The `export const config` must use literal values that can be statically analyzed:
   - ✅ `export const config = { matcher: ['/path'] };`
   - ❌ `export const config = importedConfig;`
   - ❌ `export const config = { matcher: generateMatcher() };`

3. **Static Analysis Limitations**: Next.js cannot follow imports to determine configuration values

4. **The Illusion of Correctness**: The most deceiving aspect was that our generated file contained the correct configuration, but it remained invisible to Next.js due to being dynamically imported

## Engineering Lessons

1. **Understand Framework Constraints**: Framework documentation often mentions constraints without fully explaining their implications

2. **Question Assumptions**: We assumed Next.js would process the imported configuration at runtime

3. **Static vs. Dynamic Boundaries**: Build systems have clear boundaries between what is evaluated at build time vs. runtime

4. **Automate Safely**: Our automation had to generate literal values, not just correct data structures

## Implementation Details

### Before: Dynamic Import (Not Statically Analyzable)

```typescript
import { middlewareMatcherConfig } from './utils/generatedMatcher';

// Middleware implementation...

export const config = middlewareMatcherConfig;
```

### After: Static Inline Configuration (Statically Analyzable)

```typescript
// Middleware implementation...

export const config = {
  matcher: [
    // Match all paths except those starting with excluded paths or file paths with extensions
    '/((?!api|_next|.*\\..*).*)' ,
    // Explicitly exclude locale prefixes
    '/((?!en|de|tr).*)',
    // Include root path
    '/'
  ]
};
```

### Automation Script

Created a Node.js script that:
1. Reads locale configuration from `i18n.ts` using regex
2. Generates the appropriate static matcher patterns
3. Updates `middleware.ts` directly with inline configuration
4. Runs as part of the build process via `npm run update-middleware`

### CI Integration

Added a GitHub workflow that:
1. Triggers when `i18n.ts` changes
2. Runs the middleware update script
3. Commits the changes to `middleware.ts`
4. Pushes the updated file to the repository

## Conclusion

This case illustrates how even well-designed systems can fail when they violate framework assumptions. The subtlety of the issue—functioning code that silently fails to meet build-time constraints—highlights the importance of understanding the static/dynamic boundary in modern web frameworks.

By inlining our configuration and designing automation to maintain it, we've created a robust solution that preserves the flexibility of dynamic configuration while meeting the static requirements of Next.js middleware.

Remember:

> Even the most elegant logic collapses when it defies the contract of the system it operates in. 