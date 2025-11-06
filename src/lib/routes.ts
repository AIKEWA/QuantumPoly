/**
 * Public Route Registry
 *
 * Single source of truth for all indexable public routes in the application.
 * Used by sitemap generation, SEO metadata, and CI validation.
 *
 * @module routes
 */

/**
 * List of all public routes that should be indexed by search engines
 *
 * These routes will be:
 * - Included in sitemap.xml for all supported locales
 * - Available for SEO metadata generation
 * - Validated in CI/CD pipeline
 *
 * To add a new public route:
 * 1. Add the route path to this array
 * 2. Create corresponding page in src/app/[locale]/
 * 3. Add SEO metadata to src/locales/{locale}/seo.json
 */
export const PUBLIC_ROUTES = [
  '/',
  '/ethics',
  '/privacy',
  '/imprint',
  '/gep',
  '/accessibility',
  '/contact',
  '/governance',
] as const;

/**
 * Type-safe representation of all public routes
 */
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

/**
 * Validate if a string is a valid public route
 *
 * @param route - Route to validate
 * @returns True if route is in PUBLIC_ROUTES
 */
export function isPublicRoute(route: string): route is PublicRoute {
  return PUBLIC_ROUTES.includes(route as PublicRoute);
}
