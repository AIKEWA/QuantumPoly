"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const globby_1 = require("globby");
const markdown_table_1 = require("markdown-table");
const react_docgen_typescript_1 = require("react-docgen-typescript");
const parser = (0, react_docgen_typescript_1.withDefaultConfig)({
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
});
function toTable(name, props) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const rows = [['Prop', 'Type', 'Default', 'Required', 'Description']];
    props.forEach((p) => {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        rows.push([
            `\`${p.name}\``,
            `\`${p.type?.name || '-'}\``,
            p.defaultValue?.value ? '`' + p.defaultValue.value + '`' : '—',
            p.required ? 'Yes' : 'No',
            p.description || '—',
        ]);
    });
    return `### ${name}\n\n` + (0, markdown_table_1.markdownTable)(rows) + '\n';
}
(async () => {
    try {
        const files = await (0, globby_1.globby)([
            'src/components/{Hero,About,Vision,NewsletterForm,Footer}.{tsx,ts}',
        ]);
        console.log('Found component files:', files);
        const docs = parser.parse(files);
        let out = '## Component Props\n\n';
        docs.forEach((d) => {
            console.log(`Processing component: ${d.displayName}`);
            out += toTable(d.displayName, Object.values(d.props || {}));
        });
        const readme = await fs_1.promises.readFile('README.md', 'utf8').catch(() => '');
        const markerStart = '<!-- PROPS:START -->';
        const markerEnd = '<!-- PROPS:END -->';
        const block = `${markerStart}\n${out}\n${markerEnd}`;
        const next = readme.includes(markerStart)
            ? readme.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block)
            : `${readme}\n\n${block}\n`;
        await fs_1.promises.writeFile('README.md', next, 'utf8');
        console.log('Props tables written to README.md');
    }
    catch (error) {
        console.error('Error generating props documentation:', error);
        process.exit(1);
    }
})();
