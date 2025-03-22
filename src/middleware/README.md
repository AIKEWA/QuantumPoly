# QuantumPoly Middleware Architecture

## Overview

QuantumPoly's middleware implements a robust, loop-free internationalization system that handles locale detection, redirection, and ensures a smooth user experience across different browsers, especially Safari.

## Key Features

- **Static Matcher Configuration**: Uses explicit static patterns instead of dynamic functions to ensure consistent behavior
- **Clean Exit Conditions**: Multiple safeguards to break redirect loops
- **Short-lived Cookies**: Minimal cookie lifetimes for redirect tracking
- **Locale Detection Logic**: Multi-level detection using URL, cookies, and browser preferences

## Architecture

The middleware follows a clean, modular architecture:

1. **Configuration (config.ts)**
   - Contains all static configuration parameters
   - Defines static matcher patterns without dynamic expressions
   - Centralizes cookie names, timeouts, and other constants

2. **Main Middleware (index.ts)**
   - Implements the core middleware logic
   - Contains clear exit conditions and decision points
   - Handles locale detection and redirection

## How Loop Prevention Works

The middleware prevents redirect loops through several mechanisms:

1. **Early Exit Conditions**
   - Immediately skip processing if already on a valid locale path
   - Skip if the `noRedirect` parameter is present
   - Skip if the `just-redirected` cookie is set

2. **Short-lived Cooldown Cookie**
   - A 1-second `just-redirected` cookie prevents rapid consecutive redirects
   - This cookie is cleared after use to maintain a clean state

3. **Redirect History Tracking**
   - A session-based `redirect-history` cookie tracks redirect patterns
   - Detects loops by identifying repeated paths
   - Automatically breaks loops by redirecting to the default locale with `noRedirect`

4. **Path-based Analysis**
   - Analyzes URL structure before redirecting
   - Never redirects paths that already have a valid locale prefix

## Edge Cases Handled

- **Browser Compatibility**: Special handling for Safari's unique cookie behavior
- **Race Conditions**: Protection against timing-related redirect races
- **Explicit Path Handling**: Clear rules for API routes, static files, and asset paths

## Cookie Lifecycle

| Cookie Name | Purpose | Lifetime | Cleared When |
|-------------|---------|----------|------------|
| `just-redirected` | Prevents consecutive redirects | 1 second | After next request |
| `redirect-history` | Tracks redirect patterns | 60 seconds | When reaching valid locale path |
| `NEXT_LOCALE` | Stores user locale preference | 30 days | Never (user preference) |

## Improvements Over Previous Implementation

1. **Static Configuration**: Removed dynamic matcher expressions that could cause inconsistent behavior
2. **Single Source of Truth**: Consolidated middleware into a single location (middleware/index.ts)
3. **Deterministic Logic**: Clear, predictable exit paths and decision points
4. **Optimized Cookies**: Shorter cookie lifetimes and more efficient tracking
5. **Browser Compatibility**: Better handling for Safari's cookie behavior

## Performance Considerations

The middleware is optimized to minimize unnecessary processing:
- Early exit conditions prevent redundant checks
- Path-based filtering avoids processing static files
- Efficient cookie management reduces overhead 