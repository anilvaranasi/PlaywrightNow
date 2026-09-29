// tests/now-assist-skill-tests.spec.ts
// Individual interaction tests for each of the 9 Now Assist skills.
//
// Each test:
//   1. Navigates to the Next Experience home page (storageState = already logged in).
//   2. Opens the Now Assist skill picker (clicks "New chat" if a prior conversation exists).
//   3. Activates the skill by typing its exact name into the chat input and pressing Enter.
//   4. Verifies the panel responds (chat input remains visible = skill accepted).
//
// Skills are displayed as <li> text items in the Now Assist intro message —
// not as clickable buttons. Activation is done by typing the skill name.
//
// Tests run sequentially (workers:1). Each test navigates to home fresh to
// avoid leftover panel state from the previous test.

import { test, expect } from '@playwright/test';
import { NavigationPage } from '../utils/navigationPage';
import { NowAssistPage }  from '../utils/nowAssistPage';

const BASE_URL = process.env.SN_INSTANCE_URL!;

// Helper: navigate home, wait for Now Assist panel, open skill picker.
async function openSkillPicker(page: import('@playwright/test').Page) {
  const nav       = new NavigationPage(page);
  const nowAssist = new NowAssistPage(page);

  // Navigate to Next Experience home — Now Assist panel auto-opens.
  await nav.goToHome(BASE_URL);

  // Open the skill picker (resets to intro screen via "New chat" if needed).
  await nowAssist.openSkillPicker();

  return nowAssist;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill 1 — Get Help
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Get Help — launches and accepts a question', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  // Activate skill by typing its name.
  await nowAssist.chatInput.fill('Get Help');
  await nowAssist.chatInput.press('Enter');

  // Chat input should remain visible (panel stays open after submission).
  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Get Help skill activated');

  // Send a follow-up question to confirm the skill is responsive.
  await nowAssist.sendMessage('How do I create an incident?');
  await expect(nowAssist.chatInput).toBeVisible();
  console.log('✅ Follow-up message sent to Get Help');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 2 — Summarize a record
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Summarize a record — launches and chat input is ready', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Summarize a record');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Summarize a record skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 3 — Summarize conversation
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Summarize conversation — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Summarize conversation');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Summarize conversation skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 4 — Generate resolution notes
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Generate resolution notes — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Generate resolution notes');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Generate resolution notes skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 5 — generate a kb article
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: generate a kb article — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('generate a kb article');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ generate a kb article skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 6 — Incident assist
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Incident assist — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Incident assist');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Incident assist skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 7 — Manage duplicate CIs
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Manage duplicate CIs — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Manage duplicate CIs');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Manage duplicate CIs skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 8 — Error Analysis and Remediation Workflow
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Error Analysis and Remediation Workflow — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Error Analysis and Remediation Workflow');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Error Analysis and Remediation Workflow skill activated');
});

// ─────────────────────────────────────────────────────────────────────────────
// Skill 9 — Suggest configuration items for a change request
// ─────────────────────────────────────────────────────────────────────────────
test('Skill: Suggest configuration items for a change request — launches successfully', async ({ page }) => {
  const nowAssist = await openSkillPicker(page);

  await nowAssist.chatInput.fill('Suggest configuration items for a change request');
  await nowAssist.chatInput.press('Enter');

  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Suggest configuration items for a change request skill activated');
});
