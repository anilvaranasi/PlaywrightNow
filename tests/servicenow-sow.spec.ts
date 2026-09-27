// tests/servicenow-sow.spec.ts
// Test: Open the Service Operations Workspace in ServiceNow.
//
// Prerequisites:
//   - global-setup.ts has run and saved .auth/storageState.json.
//   - playwright.config.ts sets storageState so this test starts already logged in.
//   - No login steps needed here — session is injected by the framework.

import { test, expect } from '@playwright/test';
import { NavigationPage } from '../utils/navigationPage';
import { SOWPage }        from '../utils/sowPage';

const BASE_URL = process.env.SN_INSTANCE_URL!;

test.describe('Service Operations Workspace', () => {

  test('Navigate to and open the Service Operations Workspace', async ({ page }) => {
    const nav = new NavigationPage(page);
    const sow = new SOWPage(page);

    // ── Step 1: Land on the Next Experience home page ──────────────────────
    // storageState already provides a valid session — we jump straight to the
    // app shell rather than going through login.do again.
    await nav.goToHome(BASE_URL);

    // ── Step 2: Open the Workspaces menu ──────────────────────────────────
    await nav.openWorkspacesMenu();

    // ── Step 3: Click the SOW link ────────────────────────────────────────
    await sow.open();

    // ── Step 4: Verify the SOW loaded ─────────────────────────────────────
    // The URL should contain the SOW path after navigation.
    await expect(page).toHaveURL(/\/now\/sow\//);

    console.log(`✅ Service Operations Workspace opened — URL: ${page.url()}`);
  });

});
