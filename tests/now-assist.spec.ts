// tests/now-assist.spec.ts
// Test: Open the Now Assist panel and reach the skill picker.
//
// After opening the skill picker, saves browser state to .auth/now-assist-state.json
// so downstream tests (e.g. now-assist-skills.spec.ts) start with the panel already open.

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { NavigationPage } from '../utils/navigationPage';
import { NowAssistPage }  from '../utils/nowAssistPage';

const BASE_URL = process.env.SN_INSTANCE_URL!;
export const NOW_ASSIST_STATE = path.resolve(__dirname, '../.auth/now-assist-state.json');

test.describe('Now Assist', () => {

  test('Open Now Assist panel and reach skill picker', async ({ page }) => {
    const nav       = new NavigationPage(page);
    const nowAssist = new NowAssistPage(page);

    // ── Step 1: Navigate to the Next Experience home ───────────────────────
    await nav.goToHome(BASE_URL);

    // ── Step 2: Click the Now Assist icon to open the panel ───────────────
    await nowAssist.openSkillPicker();

    // ── Step 3: Verify the panel loaded ───────────────────────────────────
    await expect(page.locator('now-chat-window')).toBeVisible();

    // ── Step 4: Save state for downstream tests ───────────────────────────
    // Skill picker is now open. Downstream tests load this state and start
    // directly in the skill picker — no navigation or panel-open steps needed.
    await page.context().storageState({ path: NOW_ASSIST_STATE });

    console.log(`✅ Now Assist skill picker open — state saved`);
  });

});
