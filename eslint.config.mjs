import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    files: ["**/*.test.js"],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/expect-expect": ["warn", { assertFunctionNames: ["expect*"] }],
    },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
];
