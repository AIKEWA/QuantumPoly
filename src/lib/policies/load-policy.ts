import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { remark } from 'remark';
import html from 'remark-html';

import { type Locale, locales } from '@/i18n';

import { extractToc, type TocItem } from './extract-toc';
import {
  parseFrontmatter,
  type PolicyMetadata,
  type PolicySlug,
  isValidPolicySlug,
} from './policy-schema';

/**
 * Loaded policy document with metadata, HTML content, and TOC.
 */
export interface LoadedPolicy {
  /** Validated policy metadata from frontmatter */
  metadata: PolicyMetadata;
  /** Rendered HTML content */
  html: string;
  /** Table of contents extracted from headings */
  toc: TocItem[];
  /** Requested locale */
  locale: string;
  /** Actual locale used (may differ if fallback occurred) */
  resolvedLocale: string;
  /** True if English fallback was used */
  isFallback: boolean;
}

/**
 * Get the absolute path to the content directory.
 * In production, content is copied to .next/server during build.
 */
function getContentRoot(): string {
  // During build/dev, use the content directory at project root
  return path.join(process.cwd(), 'content', 'policies');
}

/**
 * Check if a policy file exists for the given slug and locale.
 *
 * @param slug - Policy slug
 * @param locale - Locale code
 * @returns True if the file exists
 */
function policyExists(slug: PolicySlug, locale: string): boolean {
  const contentRoot = getContentRoot();
  const filePath = path.join(contentRoot, slug, `${locale}.md`);
  return fs.existsSync(filePath);
}

/**
 * Load and parse a policy document with locale fallback.
 * If the requested locale doesn't exist, falls back to English.
 *
 * @param slug - Policy slug (ethics, gep, privacy, imprint)
 * @param locale - Requested locale
 * @returns Loaded policy with metadata, HTML, and TOC
 * @throws Error if policy cannot be loaded or frontmatter is invalid
 */
export async function loadPolicy(slug: PolicySlug, locale: Locale): Promise<LoadedPolicy> {
  if (!isValidPolicySlug(slug)) {
    throw new Error(
      `Invalid policy slug: "${slug}". Must be one of: ethics, gep, privacy, imprint`,
    );
  }

  const contentRoot = getContentRoot();

  // Determine which locale to use (with fallback to English)
  let resolvedLocale = locale;
  let isFallback = false;

  if (!policyExists(slug, locale)) {
    // Fall back to English
    resolvedLocale = 'en';
    isFallback = true;

    // Ensure English version exists
    if (!policyExists(slug, 'en')) {
      throw new Error(
        `Policy "${slug}" not found for locale "${locale}" and English fallback is missing. ` +
          `Please create content/policies/${slug}/en.md`,
      );
    }
  }

  // Read and parse the markdown file
  const filePath = path.join(contentRoot, slug, `${resolvedLocale}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContents);

  // Validate frontmatter
  const metadata = parseFrontmatter(frontmatter, slug, resolvedLocale);

  // Extract table of contents before rendering
  const toc = await extractToc(content);

  // Render markdown to HTML with slug anchors
  const processedContent = await remark()
    .use(html)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['heading-anchor'],
        ariaLabel: 'Link to this section',
      },
    })
    .process(content);

  return {
    metadata,
    html: processedContent.toString(),
    toc,
    locale,
    resolvedLocale,
    isFallback,
  };
}

/**
 * Get all policy slugs (for static generation).
 */
export function getAllPolicySlugs(): PolicySlug[] {
  return ['ethics', 'gep', 'privacy', 'imprint'];
}

/**
 * Get all locale codes (for static generation).
 */
export function getAllLocales(): Locale[] {
  return [...locales];
}
