// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // ❌ Don't include ignores here
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("plugin:@next/next/core-web-vitals"),
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@typescript-eslint": tseslint.plugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node, // ⬅️ Node.js globals including `console`, `__dirname`, etc.
        React: "readonly",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
