import js from "@eslint/js";
import nx from "@nx/eslint-plugin";
import cypress from "eslint-plugin-cypress/flat";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import tseslint from "typescript-eslint";
import baseConfig from "../../eslint.config.mjs";
export default [
  ...baseConfig,
  ...nx.configs["flat/react"],
  // {
  //   files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  //   // Override or add rules here
  //   rules: {},
  // },
  // {
  //   files: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts", "**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
  //   // Override or add rules here
  //   rules: {},
  // },
  {
    ...cypress.configs["recommended"],
    files: ["**/*.cy.{ts,tsx,js,jsx}"],
  },
  ...tseslint.config({
    extends: [js.configs.recommended, sonarjs.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": 0,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "warn",
      "sonarjs/no-unused-vars": "warn",
      "sonarjs/no-commented-code": "warn",
      "sonarjs/no-nested-functions": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
    },
    ignores: ["src/components/Shadcn/**/*", "src/components/Reactbits/**/*", "*.d.ts"],
  }),
];

// import js from "@eslint/js";
// import reactHooks from "eslint-plugin-react-hooks";
// import reactRefresh from "eslint-plugin-react-refresh";
// import sonarjs from "eslint-plugin-sonarjs";
// import globals from "globals";
// import tseslint from "typescript-eslint";

// export default tseslint.config(
//   { ignores: ["dist"] },
//   {
//     extends: [js.configs.recommended, ...tseslint.configs.recommended, sonarjs.configs.recommended],
//     files: ["**/*.{ts,tsx}"],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//     },
//     plugins: {
//       "react-hooks": reactHooks,
//       "react-refresh": reactRefresh,
//     },
//     rules: {
//       ...reactHooks.configs.recommended.rules,
//       "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
//       "@typescript-eslint/no-unused-vars": "warn",
//       "sonarjs/no-unused-vars": "warn",
//       "sonarjs/no-commented-code": "warn",
//       "sonarjs/no-nested-functions": "warn",
//     },
//     ignores: ["src/components/Shadcn/**/*", "src/components/Reactbits/**/*", "*.d.ts"],
//   },
// );
