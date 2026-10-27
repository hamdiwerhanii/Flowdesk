import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts"
  ]),

  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
      prettier: prettierPlugin
    },
    rules: {
      "no-console": "warn",
      complexity: ["warn", 25],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "prettier/prettier": ["warn", { endOfLine: "auto" }]
    }
  }
]);
