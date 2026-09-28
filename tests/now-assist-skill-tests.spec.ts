// tests/now-assist-skill-tests.spec.ts
// Individual interaction tests for each of the 9 Now Assist skills.
//
// Each test:
//   1. Navigates to the Next Experience home page (storageState = already logged in).
//   2. Opens the Now Assist skill picker via "New chat".
//   3. Clicks the target skill button.
//   4. Verifies the skill launches (chat input ready, optional AI response received).
//
// Skills under test:
//   1. Get Help
//   2. Summarize a record
//   3. Summarize conversation
//   4. Generate resolution notes
//   5. generate a kb article
//   6. Incident assist
//   7. Manage duplicate CIs
//   8. Error Analysis and Remediation Workflow
//   9. Suggest configuration items for a change request

import { test, expect } from '@playwright/test';
import { NavigationPage } from '../utils/navigationPage';
import { NowAssistPage }  from '../utils/nowAssistPage';

const BASE_URL = process.env.SN_INSTANCE_URL!;

// Helper: navigate home and open the skill picker.
// Each test calls this to get to a consistent starting state.
async function openSkillPicker(page: import('@playwright/test').Page) {
  const nav       = new NavigationPage(page);
  const nowAssist = new NowAssistPage(page);
  await nav.goToHome(BASE_URL);
  await nowAssist.openSkillPicker();
  return nowAssist;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill 1 — Get Help
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Get Help — launches and accepts a question', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Get Help');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Get Help skill opened');

  // Send a simple question and verify the panel accepts it.
  await nowAssist.sendMessage('How do I create an incident?');
  await expect(nowAssist.chatInput).toBeVisible();
  console.log('✅ Message sent to Get Help');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 2 — Summarize a record
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Summarize a record — launches and prompts for a record', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Summarize a record');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Summarize a record skill opened');

  // Verify chat input is ready for record input.
  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 3 — Summarize conversation
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Summarize conversation — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Summarize conversation');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Summarize conversation skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 4 — Generate resolution notes
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Generate resolution notes — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Generate resolution notes');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Generate resolution notes skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 5 — generate a kb article
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: generate a kb article — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('generate a kb article');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ generate a kb article skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 6 — Incident assist
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Incident assist — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Incident assist');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Incident assist skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 7 — Manage duplicate CIs
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Manage duplicate CIs — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Manage duplicate CIs');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Manage duplicate CIs skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 8 — Error Analysis and Remediation Workflow
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Error Analysis and Remediation Workflow — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Error Analysis and Remediation Workflow');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Error Analysis and Remediation Workflow skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 9 — Suggest configuration items for a change request
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Suggest configuration items for a change request — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.clickSkill('Suggest configuration items for a change request');
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  console.log('✅ Suggest configuration items for a change request skill opened');

  await expect(nowAssist.chatInput).toBeVisible();
});
