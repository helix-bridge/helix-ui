/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@helixbridge/eslint-config/react.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  env: {
    jest: true,
  },
};
