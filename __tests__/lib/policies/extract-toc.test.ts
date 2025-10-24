import { describe, expect, it } from '@jest/globals';

interface MockNode {
  type: string;
  depth?: number;
  children?: MockNode[];
  value?: string;
}

// Mock remark and related ESM modules
jest.mock('remark', () => ({
  remark: () => ({
    parse: (markdown: string) => {
      const lines = markdown.split('\n');
      const children: MockNode[] = [];
      lines.forEach((line) => {
        const match = line.match(/^(#{2,6})\s+(.+)$/);
        if (match) {
          const depth = match[1].length;
          const text = match[2].replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1');
          children.push({ type: 'heading', depth, children: [{ type: 'text', value: text }] });
        }
      });
      return { type: 'root', children };
    },
  }),
}));

jest.mock('unist-util-visit', () => ({
  visit: (tree: MockNode, type: string, callback: (node: MockNode) => void) => {
    const visitNode = (node: MockNode): void => {
      if (node.type === type) callback(node);
      if (node.children) node.children.forEach(visitNode);
    };
    visitNode(tree);
  },
}));

import { extractToc } from '@/lib/policies/extract-toc';

describe('extractToc', () => {
  it('should extract headings from markdown', async () => {
    const markdown = `
# Page Title

## Section One

Some content here.

## Section Two

More content.

### Subsection

Even more content.
    `;

    const toc = await extractToc(markdown);

    expect(toc).toHaveLength(3);
    expect(toc[0]).toEqual({
      id: 'section-one',
      text: 'Section One',
      level: 2,
    });
    expect(toc[1]).toEqual({
      id: 'section-two',
      text: 'Section Two',
      level: 2,
    });
    expect(toc[2]).toEqual({
      id: 'subsection',
      text: 'Subsection',
      level: 3,
    });
  });

  it('should skip H1 headings', async () => {
    const markdown = `
# Main Title

## Section

Content
    `;

    const toc = await extractToc(markdown);

    expect(toc).toHaveLength(1);
    expect(toc[0].text).toBe('Section');
    expect(toc[0].level).toBe(2);
  });

  it('should skip H4+ headings', async () => {
    const markdown = `
## H2 Heading

### H3 Heading

#### H4 Heading

##### H5 Heading
    `;

    const toc = await extractToc(markdown);

    expect(toc).toHaveLength(2);
    expect(toc[0].level).toBe(2);
    expect(toc[1].level).toBe(3);
  });

  it('should generate URL-safe IDs', async () => {
    const markdown = `
## This & That

## Heading with "Quotes"

## Multiple   Spaces

## Special!@#Characters
    `;

    const toc = await extractToc(markdown);

    expect(toc[0].id).toBe('this-that');
    expect(toc[1].id).toBe('heading-with-quotes');
    expect(toc[2].id).toBe('multiple-spaces');
    expect(toc[3].id).toBe('specialcharacters');
  });

  it('should handle empty markdown', async () => {
    const toc = await extractToc('');
    expect(toc).toEqual([]);
  });

  it('should handle markdown with no headings', async () => {
    const markdown = 'Just some plain text without any headings.';
    const toc = await extractToc(markdown);
    expect(toc).toEqual([]);
  });

  it('should handle headings with inline formatting', async () => {
    const markdown = `
## Heading with **bold** text

## Heading with *italic* text

## Heading with \`code\`
    `;

    const toc = await extractToc(markdown);

    expect(toc).toHaveLength(3);
    expect(toc[0].text).toBe('Heading with bold text');
    expect(toc[1].text).toBe('Heading with italic text');
    expect(toc[2].text).toBe('Heading with code');
  });

  it('should preserve heading order', async () => {
    const markdown = `
## Third

### Third-Sub

## First

## Second

### Second-Sub
    `;

    const toc = await extractToc(markdown);

    expect(toc).toHaveLength(5);
    expect(toc[0].text).toBe('Third');
    expect(toc[1].text).toBe('Third-Sub');
    expect(toc[2].text).toBe('First');
    expect(toc[3].text).toBe('Second');
    expect(toc[4].text).toBe('Second-Sub');
  });

  it('should handle Unicode characters', async () => {
    const markdown = `
## Étude de Cas

## Über uns

## Türkçe Başlık

## 中文标题
    `;

    const toc = await extractToc(markdown);

    expect(toc).toHaveLength(4);
    expect(toc[0].text).toBe('Étude de Cas');
    expect(toc[1].text).toBe('Über uns');
    expect(toc[2].text).toBe('Türkçe Başlık');
    expect(toc[3].text).toBe('中文标题');
  });

  it('should slugify Unicode to ASCII', async () => {
    const markdown = `
## Étude de Cas

## Über uns
    `;

    const toc = await extractToc(markdown);

    // Slugify should handle Unicode appropriately
    expect(toc[0].id).toMatch(/^[a-z0-9-]+$/);
    expect(toc[1].id).toMatch(/^[a-z0-9-]+$/);
  });
});

