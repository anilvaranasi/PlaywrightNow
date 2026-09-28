// step-definitions/hooks.ts
// Cucumber Before/After hooks — manage the Playwright browser lifecycle.
//
// BeforeAll performs a fresh login (like global-setup.ts) and saves a new
// storageState.json every run — so the session is always fresh regardless
// of when it was last saved.

import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { ICustomWorld } from './world';

// Resolve all paths relative to this file's directory (step-definitions/)
// so the runner works from any working directory.
const PROJECT_ROOT  = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, 'NowConfig.env') });

const STORAGE_STATE = path.join(PROJECT_ROOT, '.auth', 'storageState.json');

const BASE_URL  = process.env.SN_INSTANCE_URL!;
const USERNAME  = process.env.SN_USERNAME!;
const PASSWORD  = process.env.SN_PASSWORD!;

// ServiceNow pages can be slow — set a generous default step timeout.
// 120s covers the Now Assist component boot time on slow instances.
setDefaultTimeout(120_000);

let browser: Browser;

BeforeAll(async () => {
  browser = await chromium.launch({ channel: 'chrome', headless: false });

  // ── Fresh login every BDD run ──────────────────────────────────────────
  // Cucumber has no equivalent of Playwright's globalSetup, so we login
  // here in BeforeAll. This guarantees the session is never stale.
  const authDir = path.dirname(STORAGE_STATE);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const loginContext = await browser.newContext();
  const loginPage    = await loginContext.newPage();

  loginPage.setDefaultNavigationTimeout(90_000);
  loginPage.setDefaultTimeout(90_000);

  await loginPage.goto(`${BASE_URL}/login.do`, { waitUntil: 'domcontentloaded' });
  await loginPage.locator('#user_name').fill(USERNAME);
  await loginPage.locator('#user_password').fill(PASSWORD);
  await Promise.all([
    loginPage.waitForNavigation({ waitUntil: 'load', timeout: 90_000 }),
    loginPage.locator('#sysverb_login').click(),
  ]);

  // Verify login succeeded — URL should no longer contain 'login'.
  if (loginPage.url().includes('login')) {
    throw new Error(`BDD login failed — still on login page. Check NowConfig.env credentials.`);
  }

  await loginContext.storageState({ path: STORAGE_STATE });
  console.log(`✅ BDD session saved to ${STORAGE_STATE}`);

  await loginPage.close();
  await loginContext.close();
});

AfterAll(async () => {
  await browser.close();
});

Before(async function (this: ICustomWorld) {
  // Each scenario gets its own context loaded with the fresh session.
  this.context = await browser.newContext({ storageState: STORAGE_STATE });
  this.page    = await this.context.newPage();
  this.page.setDefaultTimeout(90_000);
  this.page.setDefaultNavigationTimeout(90_000);
});

After(async function (this: ICustomWorld) {
  await this.page?.close();
  await this.context?.close();
});
