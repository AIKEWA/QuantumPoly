/**
 * Playwright A11y Fixtures
 *
 * Provides axe-core integration for end-to-end accessibility testing.
 * Configured to check critical and serious violations only.
 */

import AxeBuilder from '@axe-core/playwright';
import { test as base, expect } from '@playwright/test';

/**
 * Extended test fixture with accessibility helpers
 */
export const test = base.extend({
  /**
   * Make axe-core available in all tests
   */
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        // Focus on critical and serious issues
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        // Exclude third-party content if any
        .exclude('#webpack-dev-server-client-overlay');

    await use(makeAxeBuilder);
  },
});

export { expect };

/**
 * Helper to inject axe and check accessibility
 * Throws on critical or serious violations
 */
export async function checkA11y(
  page: ReturnType<typeof base>['page'],
  options?: {
    /** Specific element to scan (default: entire page) */
    include?: string[];
    /** Elements to exclude from scan */
    exclude?: string[];
    /** Custom axe rules configuration */
    rules?: Record<string, unknown>;
  },
) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('#webpack-dev-server-client-overlay');

  if (options?.include) {
    builder.include(options.include);
  }

  if (options?.exclude) {
    for (const selector of options.exclude) {
      builder.exclude(selector);
    }
  }

  if (options?.rules) {
    // Apply custom rules configuration
    for (const [ruleId, config] of Object.entries(options.rules)) {
      if (typeof config === 'object' && config !== null) {
        builder.options({
          rules: {
            [ruleId]: config,
          },
        });
      }
    }
  }

  const results = await builder.analyze();

  // Format violations for helpful error messages
  if (results.violations.length > 0) {
    const criticalAndSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    if (criticalAndSerious.length > 0) {
      const violationMessages = criticalAndSerious.map((violation) => {
        const nodes = violation.nodes.map((node) => `  - ${node.html}`).join('\n');
        return `\n[${violation.impact?.toUpperCase()}] ${violation.help}\n  Rule: ${violation.id}\n  ${violation.helpUrl}\n  Affected nodes:\n${nodes}`;
      });

      throw new Error(
        `Accessibility violations found:\n${violationMessages.join('\n\n')}\n\nTotal: ${criticalAndSerious.length} critical/serious violation(s)`,
      );
    }
  }

  return results;
}

/**
 * Helper to generate accessibility report summary
 */
export function formatA11yReport(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  const { violations, passes, incomplete } = results;

  return {
    summary: {
      violations: violations.length,
      passes: passes.length,
      incomplete: incomplete.length,
    },
    violations: violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    })),
  };
}

