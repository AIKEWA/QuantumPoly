import { promises as fs } from 'fs';

import { globby } from 'globby';
import { markdownTable } from 'markdown-table';
import { withDefaultConfig } from 'react-docgen-typescript';

const parser = withDefaultConfig({
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
});

function toTable(name: string, props: any) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const rows = [['Prop', 'Type', 'Default', 'Required', 'Description']];
  props.forEach((p: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    rows.push([
      `\`${p.name}\``,
      `\`${p.type?.name || '-'}\``,
      p.defaultValue?.value ? '`' + p.defaultValue.value + '`' : '—',
      p.required ? 'Yes' : 'No',
      p.description || '—',
    ]);
  });
  return `### ${name}\n\n` + markdownTable(rows) + '\n';
}

(async () => {
  try {
    const files = await globby([
      'src/components/{Hero,About,Vision,NewsletterForm,Footer}.{tsx,ts}',
    ]);

    console.log('Found component files:', files);

    const docs = parser.parse(files);
    let out = '## Component Props\n\n';

    docs.forEach((d) => {
      console.log(`Processing component: ${d.displayName}`);
      out += toTable(d.displayName, Object.values(d.props || {}));
    });

    const readme = await fs.readFile('README.md', 'utf8').catch(() => '');
    const markerStart = '<!-- PROPS:START -->';
    const markerEnd = '<!-- PROPS:END -->';
    const block = `${markerStart}\n${out}\n${markerEnd}`;

    const next = readme.includes(markerStart)
      ? readme.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block)
      : `${readme}\n\n${block}\n`;

    await fs.writeFile('README.md', next, 'utf8');
    console.log('Props tables written to README.md');
  } catch (error) {
    console.error('Error generating props documentation:', error);
    process.exit(1);
  }
})();
