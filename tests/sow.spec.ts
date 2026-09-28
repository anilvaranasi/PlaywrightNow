// tests/sow.spec.ts
// Test: Open the Service Operations Workspace in ServiceNow.
// After opening SOW, saves browser state to .auth/sow-state.json so
// downstream tests (e.g. now-assist.spec.ts) can start already inside SOW.

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import { NavigationPage } from '../utils/navigationPage';
import { SOWPage }        from '../utils/sowPage';

const BASE_URL      = process.env.SN_INSTANCE_URL!;
export const SOW_STATE = path.resolve(__dirname, '../.auth/sow-state.json');

test.describe('Service Operations Workspace', () => {

  test('Navigate to and open the Service Operations Workspace', async ({ page }) => {
    const nav = new NavigationPage(page);
    const sow = new SOWPage(page);

    // ── Step 1: Land on the Next Experience home ───────────────────────────
    await nav.goToHome(BASE_URL);

    // ── Step 2: Open Workspaces menu ──────────────────────────────────────
    await nav.openWorkspacesMenu();

    // ── Step 3: Open SOW ──────────────────────────────────────────────────
    await sow.open();

    // ── Step 4: Verify SOW loaded ─────────────────────────────────────────
    await expect(page).toHaveURL(/\/now\/sow\//);

    // ── Step 5: Save browser state for downstream tests ───────────────────
    // Captures cookies + localStorage while the browser is already inside SOW.
    // now-assist.spec.ts loads this state so it starts here without repeating
    // the navigation steps above.
    await page.context().storageState({ path: SOW_STATE });

    console.log(`✅ SOW opened — state saved to ${SOW_STATE}`);
  });

});
