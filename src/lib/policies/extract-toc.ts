import type { Root, Heading, Text } from 'mdast';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';

/**
 * Table of contents item representing a heading in the document.
 */
export interface TocItem {
  /** Anchor ID for linking (slugified from text) */
  id: string;
  /** Heading text content */
  text: string;
  /** Heading level (2 = h2, 3 = h3, etc.) */
  level: number;
}

/**
 * Generate a URL-safe slug from heading text.
 * Matches the behavior of rehype-slug for consistency.
 *
 * @param text - Heading text to slugify
 * @returns URL-safe anchor ID
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

/**
 * Extract text content from a heading node.
 * Handles nested inline elements (text, emphasis, strong, etc.).
 *
 * @param node - Heading AST node
 * @returns Concatenated text content
 */
function extractHeadingText(node: Heading): string {
  let text = '';
  visit(node, 'text', (textNode: Text) => {
    text += textNode.value;
  });
  return text;
}

/**
 * Extract table of contents from markdown content.
 * Parses the markdown AST and extracts headings at levels 2-3.
 *
 * @param markdown - Raw markdown content
 * @returns Array of TOC items with IDs, text, and levels
 */
export async function extractToc(markdown: string): Promise<TocItem[]> {
  const toc: TocItem[] = [];

  // Parse markdown to AST
  const tree = remark().parse(markdown) as Root;

  // Visit all heading nodes
  visit(tree, 'heading', (node: Heading) => {
    // Only include h2 and h3 in TOC (skip h1 which is the page title)
    if (node.depth === 2 || node.depth === 3) {
      const text = extractHeadingText(node);
      if (text) {
        toc.push({
          id: slugify(text),
          text,
          level: node.depth,
        });
      }
    }
  });

  return toc;
}
