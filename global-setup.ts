// global-setup.ts
// Runs ONCE before the entire test suite.
// Performs a real browser login and persists cookies + localStorage to
// .auth/storageState.json so every test starts pre-authenticated.

import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'NowConfig.env') });

const STORAGE_STATE_PATH = path.resolve(__dirname, '.auth/storageState.json');

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const baseURL  = process.env.SN_INSTANCE_URL!;
  const username = process.env.SN_USERNAME!;
  const password = process.env.SN_PASSWORD!;

  if (!baseURL || !username || !password) {
    throw new Error(
      'Missing required env vars: SN_INSTANCE_URL, SN_USERNAME, SN_PASSWORD. ' +
      'Copy config/NowConfig.env.example → NowConfig.env and fill in values.'
    );
  }

  // Ensure the .auth directory exists before saving state.
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Launch a headless browser solely for the login sequence.
  // We use a fresh context (no storageState) so we always get a clean token.
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  // global-setup runs outside playwright.config.ts so it does not inherit
  // the configured navigationTimeout. Set it explicitly on the page.
  page.setDefaultNavigationTimeout(90_000);
  page.setDefaultTimeout(90_000);

  try {
    // ── Navigate to login page ─────────────────────────────────────────────
    await page.goto(`${baseURL}/login.do`, { waitUntil: 'domcontentloaded' });

    // ── Fill credentials ───────────────────────────────────────────────────
    await page.locator('#user_name').fill(username);
    await page.locator('#user_password').fill(password);

    // ── Submit ─────────────────────────────────────────────────────────────
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 60_000 }),
      page.locator('#sysverb_login').click(),
    ]);

    // ── Verify login succeeded ─────────────────────────────────────────────
    const currentURL = page.url();
    if (currentURL.includes('login')) {
      throw new Error(
        `Login failed — still on login page: ${currentURL}. ` +
        'Check SN_USERNAME and SN_PASSWORD in NowConfig.env.'
      );
    }

    // ── Persist session ────────────────────────────────────────────────────
    // storageState captures cookies AND localStorage. ServiceNow stores its
    // session token in both, so we need both to skip re-authentication.
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`✅ Global setup complete — session saved to ${STORAGE_STATE_PATH}`);

  } finally {
    // Always close the browser, even if login fails.
    await context.close();
    await browser.close();
  }
}
