// tests/now-assist-skills.spec.ts
// Test: Login → open Now Assist panel → capture available skills → write to file.
//
// Self-contained — uses storageState from global-setup.ts (authenticated session).
// Does not depend on now-assist.spec.ts having run first.

import { test, expect } from '@playwright/test';
import { NavigationPage } from '../utils/navigationPage';
import { NowAssistPage }  from '../utils/nowAssistPage';

const BASE_URL = process.env.SN_INSTANCE_URL!;

test('Capture available Now Assist skills and write to file', async ({ page }) => {
  const nav       = new NavigationPage(page);
  const nowAssist = new NowAssistPage(page);

  // ── Step 1: Navigate to Next Experience home ─────────────────────────────
  // Already authenticated via storageState — no login needed.
  await nav.goToHome(BASE_URL);

  // ── Step 2: Open Now Assist skill picker ─────────────────────────────────
  // Waits for "New chat" to be enabled (not just visible) before clicking.
  await nowAssist.openSkillPicker();

  // ── Step 3: Read all skill labels from the screen ────────────────────────
  const skills = await nowAssist.getVisibleSkills();

  // ── Step 4: Write skills to output/now-assist-skills.txt ─────────────────
  nowAssist.writeSkillsToFile(skills);

  // ── Step 5: Print to console ──────────────────────────────────────────────
  console.log(`\n📋 Now Assist skills available (${skills.length}):`);
  skills.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));

  // At least one skill must be present for the test to pass.
  expect(skills.length).toBeGreaterThan(0);
});
