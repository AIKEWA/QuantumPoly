import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Next.js recommended rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    ignores: [
      ".next/**/*",
      "out/**/*",
      "node_modules/**/*",
      "dist/**/*",
      "build/**/*",
      "coverage/**/*",
      "*.config.js",
      "*.config.mjs"
    ],
  },
];

export default eslintConfig;
