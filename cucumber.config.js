// cucumber.config.js
// Cucumber runner configuration for Playwright-backed BDD tests.

const path = require('path');
const root = __dirname; // cucumber.config.js is at project root

module.exports = {
  default: {
    // Absolute paths so the runner works from any working directory
    paths: [path.join(root, 'features/**/*.feature')],

    // Step definitions + hooks
    require: [path.join(root, 'step-definitions/**/*.ts')],

    // Use ts-node to execute TypeScript step definitions directly
    requireModule: ['ts-node/register'],

    // Pretty-print results in the terminal
    format: [
      'pretty',
      'json:output/cucumber-report.json',
    ],

    // Run scenarios one at a time
    parallel: 1,
  },
};
