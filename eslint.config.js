// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": ["error", ""],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  eslintConfigPrettier
);
