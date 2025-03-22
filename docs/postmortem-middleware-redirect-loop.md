# Postmortem: Infinite Redirect Loops in Edge Middleware

## Summary

We encountered a critical issue with our Next.js application where users were experiencing infinite redirect loops when accessing certain pages. This caused browser timeouts, degraded user experience, and increased server load. Investigation revealed the root cause was a dynamic expression in the middleware matcher configuration, specifically using a function call in `config.matcher` where only static values are supported.

## Timeline

- **Incident Discovery**: Users reported browser timeouts and inability to access the site
- **Investigation**: Server logs showed abnormally high request counts for the same paths
- **Diagnosis**: Terminal logs revealed the error: `"Unsupported node type "CallExpression" at "config.matcher"` 
- **Resolution**: Replaced dynamic matcher with static configuration and implemented proper CI tooling
- **Verification**: Tested with our Playwright test suite to confirm redirects work correctly

## Root Cause

The root cause was identified as a mismatch between our implementation and Next.js middleware constraints. We were using a dynamic function call in the middleware matcher configuration:

```javascript
export const config = {
  matcher: createMiddlewareMatcher({
    locales,
    excludePaths: ['api', '_next'],
    includeRoot: true
  })
};
```

Next.js middleware requires static values in the `config.matcher` array. Dynamic expressions, including function calls, are not supported at build time. This created a situation where:

1. The middleware configuration failed to compile properly
2. Next.js couldn't correctly determine which paths to exclude from middleware processing
3. The middleware ran on all paths, including those that already had locale prefixes
4. This created an infinite loop of redirects as the middleware kept running on already-localized URLs

The error message `"Unsupported node type "CallExpression" at "config.matcher"` appeared in the logs, but was easy to overlook as the application would still build and run.

## Resolution

Our fix consisted of multiple components:

1. **Immediate Fix**: Replaced the dynamic matcher with a static, hardcoded array:
   ```javascript
   export const config = {
     matcher: [
       '/((?!api|_next|.*\\..*).*)' ,
       '/((?!en|de|tr).*)',
       '/'
     ]
   };
   ```

2. **Maintainable Solution**: Created a CI/build-time script (`generateMatcher.ts`) that:
   - Reads the current locale configuration from `i18n.ts`
   - Generates a static matcher configuration file
   - Is run automatically as part of the build process

3. **Testing**: Added comprehensive Playwright tests to:
   - Verify the middleware handles redirects correctly
   - Ensure no redirect loops occur
   - Confirm the middleware skips processing for already-localized paths

## What Worked Well

- Our extensive middleware logging helped diagnose the issue
- The redirect loop protection logic in the middleware (counting redirects with a cookie) prevented infinite server-side loops
- The debug overlay tool allowed us to inspect middleware behavior visually

## What Didn't Work Well

- Dynamic code was used where static values were required
- We lacked automated tests specifically for middleware behavior
- The error message was not prominently displayed in our logs
- Code reviews didn't catch this architectural incompatibility

## Prevention Measures

1. **Build-time Generation**:
   - Created a script to generate static matcher configurations before build
   - Added this to our CI pipeline via npm scripts: `"build": "npm run generate-matcher && next build"`

2. **Automated Testing**:
   - Added Playwright tests specifically for middleware redirect behavior
   - Implemented assertions to verify the absence of redirect loops

3. **Documentation**:
   - Added comments explaining Next.js middleware constraints
   - Created this postmortem for future reference

4. **Code Review Guidelines**:
   - Updated review checklist to include verification of static middleware configuration
   - Added a lint rule to warn about dynamic expressions in middleware config

## Lessons Learned

1. **Framework Constraints Matter**: Even when code is syntactically valid and passes TypeScript checks, it may violate runtime framework constraints.

2. **Automated Testing is Crucial**: We should have specific tests for middleware behavior, not just application functionality.

3. **Elegant vs. Compatible**: Our dynamic matcher code was elegant but incompatible with Next.js constraints. Sometimes simpler, more explicit code is better.

4. **Log Analysis**: More attention should be paid to build warnings and errors, even when the application seems to work.

5. **Generated Code**: When dynamic configuration is needed at build time, code generation scripts are a better approach than runtime dynamics.

## Future Enhancements

1. **Middleware Debugger Overlay**: Improve our debug overlay to show matcher configuration and path matching decisions.

2. **Static Analysis**: Add a custom ESLint rule to catch dynamic expressions in middleware config.

3. **Locale Management**: Consider using a more integrated i18n solution that handles middleware configuration automatically.

4. **Monitoring**: Implement better monitoring for redirect loops and high request volumes.

## Conclusion

This incident highlighted the importance of understanding framework constraints even when implementing seemingly straightforward functionality. By replacing dynamic code with static configuration and adding proper tooling, we've not only fixed the immediate issue but also improved our development workflow and testing practices.

The Next.js middleware system is powerful but requires adherence to specific patterns. Our solution maintains the flexibility of dynamic configuration while respecting the static requirements of the middleware system at build time. 