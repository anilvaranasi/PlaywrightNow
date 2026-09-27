const { test, expect } = require('@playwright/test');
const path = require('path');

// Load config from IBMSGConfig.env
require('dotenv').config({ path: path.resolve(__dirname, '../IBMSGConfig.env') });

const BASE_URL = process.env.SN_INSTANCE_URL;
const USERNAME = process.env.SN_USERNAME;
const PASSWORD = process.env.SN_PASSWORD;

test('open ServiceNow instance', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveTitle(/Login/);
  console.log(`✅ Opened: ${BASE_URL} — title: ${await page.title()}`);
});
