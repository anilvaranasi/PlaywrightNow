// global-setup.ts
// Runs ONCE before the entire test suite.
// Performs a real browser login and persists cookies + localStorage to
// .auth/storageState.json so every test starts pre-authenticated.

import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'IBMSGConfig.env') });

const STORAGE_STATE_PATH = path.resolve(__dirname, '.auth/storageState.json');

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const baseURL  = process.env.SN_INSTANCE_URL!;
  const username = process.env.SN_USERNAME!;
  const password = process.env.SN_PASSWORD!;

  if (!baseURL || !username || !password) {
    throw new Error(
      'Missing required env vars: SN_INSTANCE_URL, SN_USERNAME, SN_PASSWORD. ' +
      'Copy config/IBMSGConfig.env.example → IBMSGConfig.env and fill in values.'
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

  try {
    // ── Navigate to login page ─────────────────────────────────────────────
    await page.goto(`${baseURL}/login.do`, { waitUntil: 'domcontentloaded' });

    // ── Fill credentials ───────────────────────────────────────────────────
    // ServiceNow classic login uses id-based inputs; #user_name / #user_password
    // are stable across most SN versions. Using locator() + fill() avoids
    // race conditions that page.type() can introduce on slower instances.
    await page.locator('#user_name').fill(username);
    await page.locator('#user_password').fill(password);

    // ── Submit ─────────────────────────────────────────────────────────────
    // Click the login button and wait for navigation. 'networkidle' ensures
    // all post-login redirect XHRs (session setup, user preferences) complete
    // before we snapshot the storage state.
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60_000 }),
      page.locator('#sysverb_login').click(),
    ]);

    // ── Verify login succeeded ─────────────────────────────────────────────
    // If the URL still contains 'login.do' then credentials were rejected.
    const currentURL = page.url();
    if (currentURL.includes('login.do')) {
      throw new Error(
        `Login failed — still on login page: ${currentURL}. ` +
        'Check SN_USERNAME and SN_PASSWORD in IBMSGConfig.env.'
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
