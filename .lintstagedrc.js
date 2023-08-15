const path = require("path");

const buildAppsEslintCommand = (filenames) =>
  `npm run lint -w apps -- --fix --file ${filenames.map((f) => path.relative("packages/apps", f)).join(" --file ")}`;

module.exports = {
  "packages/apps/src/**/*.{js,jsx,ts,tsx}": [buildAppsEslintCommand],
  "**/*.{js,jsx,ts,tsx,json}": "prettier --write",
};
