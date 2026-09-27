// tests/servicenow-sow.spec.js
// Test: Login to ServiceNow and open the Service Operations Workspace.

const { test, expect } = require('@playwright/test');
const { LoginPage }      = require('../utils/loginPage');
const { NavigationPage } = require('../utils/navigationPage');
const { SOWPage }        = require('../utils/sowPage');

const BASE_URL = process.env.SN_INSTANCE_URL;
const USERNAME = process.env.SN_USERNAME;
const PASSWORD = process.env.SN_PASSWORD;

test('Login and open Service Operations Workspace', async ({ page }) => {
  // 1. Login
  const loginPage = new LoginPage(page);
  await loginPage.navigate(BASE_URL);
  await loginPage.login(USERNAME, PASSWORD);

  // 2. Navigate to home
  const nav = new NavigationPage(page);
  await nav.goToHome(BASE_URL);

  // 3. Open Workspaces menu and launch SOW
  await nav.openWorkspacesMenu();
  const sow = new SOWPage(page);
  await sow.open();

  console.log(`✅ Service Operations Workspace opened — URL: ${page.url()}`);
});
