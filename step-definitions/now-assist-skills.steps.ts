// step-definitions/now-assist-skills.steps.ts
// Step definitions for features/now-assist-skills.feature.
// Uses the same Page Objects as the Playwright spec tests.

import { Given, When, Then } from '@cucumber/cucumber';
import { expect }            from '@playwright/test';
import { NavigationPage }    from '../utils/navigationPage';
import { NowAssistPage }     from '../utils/nowAssistPage';
import { ICustomWorld }      from './world';

const BASE_URL = process.env.SN_INSTANCE_URL!;

// ── Background steps ───────────────────────────────────────────────────────

Given('I am logged in to ServiceNow', async function (this: ICustomWorld) {
  // storageState injected by hooks.ts Before hook — browser is already authenticated.
  // This step is intentionally a no-op; it documents intent in the feature file.
});

Given('I am on the Next Experience home page', async function (this: ICustomWorld) {
  const nav = new NavigationPage(this.page);
  await nav.goToHome(BASE_URL);
});

// ── When steps ─────────────────────────────────────────────────────────────

When('I open the Now Assist skill picker', async function (this: ICustomWorld) {
  const nowAssist = new NowAssistPage(this.page);
  await nowAssist.openSkillPicker();

  // Store page object on world so Then steps can reuse it.
  (this as any).nowAssist = nowAssist;
});

// ── Then steps ─────────────────────────────────────────────────────────────

Then('I should see at least 1 skill available', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist;
  const skills = await nowAssist.getVisibleSkills();

  // Store for subsequent steps in this scenario.
  (this as any).skills = skills;

  expect(skills.length).toBeGreaterThan(0);
  console.log(`✅ ${skills.length} skill(s) found`);
});

Then('the available skills should be written to a file', async function (this: ICustomWorld) {
  const nowAssist: NowAssistPage = (this as any).nowAssist;
  const skills: string[]         = (this as any).skills ?? await nowAssist.getVisibleSkills();

  nowAssist.writeSkillsToFile(skills);

  console.log(`\n📋 Skills captured (${skills.length}):`);
  skills.forEach((s, i) => console.log(`   ${i + 1}. ${s}`));
});

Then('the skill {string} should be visible', async function (this: ICustomWorld, skillName: string) {
  const nowAssist: NowAssistPage = (this as any).nowAssist ?? new NowAssistPage(this.page);
  await nowAssist.assertSkillVisible(skillName as any);

  console.log(`✅ Skill visible: ${skillName}`);
});
