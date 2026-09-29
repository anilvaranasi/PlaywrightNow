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
// (Reuses "When/Given I open the Now Assist skill picker" from now-assist-skills.steps.ts)

// ── When steps ─────────────────────────────────────────────────────────────

When('I click the Now Assist skill {string}', async function (this: ICustomWorld, skillName: string) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  // Skills are activated by typing their name, not clicking a button.
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  await nowAssist.chatInput.fill(skillName);
  await nowAssist.chatInput.press('Enter');
  (this as any).nowAssist = nowAssist;
  console.log(`⌨️  Activated skill: ${skillName}`);
});

When('I type {string} in the chat', async function (this: ICustomWorld, message: string) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  let textToSend = message;

  // Dynamically resolve live incident number if placeholder or keyword is used
  if (message.toLowerCase().includes('live incident') || message === '{live_incident}') {
    const liveInc = await nowAssist.getLiveIncidentNumber();
    textToSend = liveInc;
    console.log(`🔍 Retrieved live incident number from user session: ${liveInc}`);
  }

  await nowAssist.sendMessage(textToSend);
  (this as any).lastMessage = textToSend;
  console.log(`💬 Sent message: ${textToSend}`);
});

When('I provide a live incident number in the chat', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  const liveInc = await nowAssist.getLiveIncidentNumber();
  await nowAssist.sendMessage(liveInc);
  (this as any).lastMessage = liveInc;
  console.log(`💬 Sent live incident: ${liveInc}`);
});

// ── Then steps ─────────────────────────────────────────────────────────────

Then('the Now Assist chat input should be visible', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  await nowAssist.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
  await expect(nowAssist.chatInput).toBeVisible({ timeout: 30_000 });
  console.log('✅ Chat input is visible');
});

Then('the message is accepted by Now Assist', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  
  // Give Now Assist a moment to process and return response
  await this.page.waitForTimeout(4_000);
  const dialog = this.page.getByRole('dialog', { name: 'Chat Dialog' }).or(this.page.getByRole('dialog', { name: 'Now Assist' }));
  await expect(dialog.first()).toBeVisible({ timeout: 15_000 });

  // Extract and print the actual response text to the console
  try {
    const responseText = await nowAssist.waitForResponse(15_000);
    if (responseText && responseText.length > 0) {
      console.log('\n🤖 ── Now Assist AI Response ──────────────────────────────');
      console.log(responseText);
      console.log('───────────────────────────────────────────────────────────\n');
    }
  } catch (e) {
    console.log('✅ Message accepted — Now Assist panel is active');
  }
});
