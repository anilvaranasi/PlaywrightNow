// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

// Load config from IBMSGConfig.env for all tests
require('dotenv').config({ path: path.resolve(__dirname, 'IBMSGConfig.env') });

module.exports = defineConfig({
  testDir: './tests',
  timeout: (parseInt(process.env.TIMEOUT_SECONDS) || 30) * 1000,
  retries: 0,
  use: {
    headless: false,       // show the browser window
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    channel: 'chrome',     // use installed system Chrome
    baseURL: process.env.SN_INSTANCE_URL,
  },
  projects: [
    {
      name: 'chrome',
      use: {
        channel: 'chrome',
      },
    },
  ],
});
