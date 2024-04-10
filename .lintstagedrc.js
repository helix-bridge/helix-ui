const path = require("path");

const buildAppsEslintCommand = (filenames) =>
  `npm run lint -- --fix --file ${filenames.map((f) => path.relative("./", f)).join(" --file ")}`;

module.exports = {
  "src/**/*.{js,jsx,ts,tsx}": [buildAppsEslintCommand],
  "**/*.{js,jsx,ts,tsx,json}": "prettier --write",
};
