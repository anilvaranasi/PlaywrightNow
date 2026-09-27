// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from IBMSGConfig.env at project root.
dotenv.config({ path: path.resolve(__dirname, 'IBMSGConfig.env') });

// Path where global-setup.ts will persist the authenticated session.
export const STORAGE_STATE = path.resolve(__dirname, '.auth/storageState.json');

export default defineConfig({
  testDir: './tests',

  // ── Sequential execution ────────────────────────────────────────────────────
  // ServiceNow ties UI state to a single browser session per user account.
  // Running tests in parallel causes session hijacking (one worker navigates
  // away while another is mid-form), which produces flaky, hard-to-debug
  // failures. workers:1 is the safe baseline; scale only with dedicated
  // service accounts (one account per worker).
  workers: 1,
  fullyParallel: false,

  // ── Timeouts ────────────────────────────────────────────────────────────────
  // ServiceNow loads many async client scripts, UI builders, and iFrames.
  // Standard 30 s test timeout is often too short; 90 s is a safer baseline.
  timeout: (parseInt(process.env.TIMEOUT_SECONDS ?? '90')) * 1_000,

  // Per-assertion timeout — SN UI can take several seconds to reflect changes.
  expect: { timeout: 15_000 },

  retries: 0,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    headless: false,
    channel: 'chrome',            // use system Chrome, not Playwright's bundled build
    baseURL: process.env.SN_INSTANCE_URL,

    // Reuse the authenticated session produced by global-setup.ts.
    // This means every test starts already logged in — no repeated login flows.
    storageState: STORAGE_STATE,

    // Capture evidence only on failure to keep disk usage low.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // ServiceNow pages fire many background XHR/fetch calls during navigation.
    // 'networkidle' waits until there are no network requests for 500 ms,
    // giving async scripts time to finish before Playwright proceeds.
    navigationTimeout: 60_000,
    actionTimeout:     30_000,
  },

  // ── Global setup ────────────────────────────────────────────────────────────
  // Runs once before all tests. Logs in and saves session to storageState.json.
  // Tests that import storageState skip the login entirely.
  globalSetup: './global-setup.ts',

  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
