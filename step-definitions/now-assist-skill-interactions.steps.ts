// step-definitions/now-assist-skill-interactions.steps.ts
// Step definitions for features/now-assist-skill-interactions.feature.
// Covers launching each of the 9 Now Assist skills via the skill picker.

import { Given, When, Then } from '@cucumber/cucumber';
import { expect }            from '@playwright/test';
import { NavigationPage }    from '../utils/navigationPage';
import { NowAssistPage, NowAssistSkill } from '../utils/nowAssistPage';
import { ICustomWorld }      from './world';

const BASE_URL = process.env.SN_INSTANCE_URL!;

// ── Background steps ───────────────────────────────────────────────────────
// "I am logged in" and "I am on the Next Experience home page" are already
// defined in now-assist-skills.steps.ts and are shared across feature files.
// Only add the skill-picker background step here.

Given('I open the Now Assist skill picker', async function (this: ICustomWorld) {
  const nowAssist = new NowAssistPage(this.page);
  await nowAssist.openSkillPicker();
  (this as any).nowAssist = nowAssist;
});

// ── When steps ─────────────────────────────────────────────────────────────

When('I click the Now Assist skill {string}', async function (this: ICustomWorld, skillName: string) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  await nowAssist.clickSkill(skillName as NowAssistSkill);
  (this as any).nowAssist = nowAssist;
  console.log(`🖱️  Clicked skill: ${skillName}`);
});

When('I type {string} in the chat', async function (this: ICustomWorld, message: string) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  await nowAssist.sendMessage(message);
  (this as any).lastMessage = message;
  console.log(`💬 Sent message: ${message}`);
});

// ── Then steps ─────────────────────────────────────────────────────────────

Then('the Now Assist chat input should be visible', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  await expect(nowAssist.chatInput).toBeVisible();
  console.log('✅ Chat input is visible');
});

Then('the message is accepted by Now Assist', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  // After sending a message the chat input should remain visible (panel stays open).
  await expect(nowAssist.chatInput).toBeVisible({ timeout: 15_000 });
  console.log('✅ Message accepted — chat input remains visible');
});
