/**
 * Utility for validating heading hierarchy in accessibility tests.
 * Ensures WCAG 2.2 AA compliance by checking heading level progression.
 */

/**
 * Extract all heading elements from a container and assert proper hierarchy.
 * Heading levels must be non-decreasing (h1 → h2 → h3, no jumps).
 * 
 * @param container - DOM container to search for headings
 * @throws Error if heading hierarchy has jumps (e.g., h1 → h3)
 * 
 * @example
 * ```ts
 * const { container } = render(<MyComponent />);
 * assertHeadingOrder(container);
 * ```
 */
export function assertHeadingOrder(container: HTMLElement): void {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  if (headings.length === 0) {
    // No headings to validate
    return;
  }

  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const tagName = heading.tagName.toLowerCase();
    const currentLevel = Number.parseInt(tagName.charAt(1), 10);

    if (index === 0) {
      // First heading can be any level (though h1 is recommended)
      previousLevel = currentLevel;
      return;
    }

    // Check for level jumps (e.g., h1 → h3)
    // Heading levels should only increase by 1 or stay the same/decrease
    if (currentLevel > previousLevel + 1) {
      const headingText = heading.textContent?.trim() || '(no text)';
      throw new Error(
        `Heading hierarchy violation: Found ${tagName} after h${previousLevel}. ` +
        `Heading levels should not skip (e.g., h1 → h3). ` +
        `Heading text: "${headingText}" at index ${index}`
      );
    }

    previousLevel = currentLevel;
  });
}

/**
 * Get all headings from a container with their levels and text content.
 * Useful for debugging heading structure.
 * 
 * @param container - DOM container to search for headings
 * @returns Array of heading information
 * 
 * @example
 * ```ts
 * const headings = getHeadingStructure(container);
 * console.log(headings); // [{ level: 1, text: 'Title', tag: 'h1' }, ...]
 * ```
 */
export function getHeadingStructure(container: HTMLElement): Array<{
  level: number;
  text: string;
  tag: string;
}> {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  return headings.map((heading) => {
    const tag = heading.tagName.toLowerCase();
    const level = Number.parseInt(tag.charAt(1), 10);
    const text = heading.textContent?.trim() || '';
    
    return { level, text, tag };
  });
}

