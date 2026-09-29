// utils/nowAssistPage.ts
// Page Object for the Now Assist chat panel (Next Experience UI).
//
// Now Assist is accessible from the Next Experience home page (/now/nav/ui/home).
// Clicking "New chat" opens the skill picker which lists available AI actions.

import { Page, expect } from '@playwright/test';
import { BasePage } from './basePage';
import * as fs from 'fs';
import * as path from 'path';

// All skill options visible in the Now Assist panel (as captured from the instance).
// Exact label strings — must match what the SN UI renders.
export const NOW_ASSIST_SKILLS = [
  'Error Analysis and Remediation Workflow',
  'generate a kb article',
  'Generate resolution notes',
  'Get Help',
  'Incident assist',
  'Manage duplicate CIs',
  'Suggest configuration items for a change request',
  'Summarize a record',
  'Summarize conversation',
] as const;

export type NowAssistSkill = typeof NOW_ASSIST_SKILLS[number];

/** Minimum expected response length (chars) for a Now Assist reply. */
const MIN_RESPONSE_CHARS = 10;

/** Default wait for a Now Assist AI response to appear (ms). */
const RESPONSE_TIMEOUT_MS = 90_000;

export class NowAssistPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Core panel elements ──────────────────────────────────────────────────

  /**
   * The Now Assist chat input textbox (visible after a skill is selected or
   * after "New chat").
   */
  get chatInput() {
    return this.page.locator(
      'textarea[aria-label*="Now Assist" i], textarea[placeholder*="Now Assist" i], input[placeholder*="Now Assist" i]'
    ).first();
  }

  /**
   * The "New chat" (+) icon button in the Now Assist panel header.
   * Only visible when a prior conversation is active.
   */
  get newChatButton() {
    return this.page.getByRole('button', { name: 'New chat' });
  }

  /**
   * The Now Assist toggle button in the nav bar.
   */
  get nowAssistIconButton() {
    return this.page.locator('button[aria-label="Now Assist"]').first();
  }

  /**
   * The last AI response message bubble in the chat.
   * Selects the most recently rendered assistant message.
   */
  get lastAssistantMessage() {
    return this.page.locator(
      'dialog[aria-label="Chat Dialog"] [class*="message"], dialog[aria-label="Now Assist"] [class*="message"], now-va-chat-launcher .now-chat-message--assistant, now-chat-window .now-chat-message--assistant, [data-role="assistant-message"]'
    ).last();
  }

  // ── Navigation / setup ───────────────────────────────────────────────────

  /**
   * Navigate to the Now Assist skill picker.
   * - If a prior conversation is active, clicks "New chat" to reset.
   * - Expands truncated skill list by clicking "Show more" if present.
   * - Waits until chat input is visible before returning.
   */
  async openSkillPicker(): Promise<void> {
    // If Now Assist dialog is not open yet, click the Now Assist button
    const nowAssistDialog = this.page.getByRole('dialog', { name: 'Now Assist' });
    if (!(await nowAssistDialog.isVisible().catch(() => false))) {
      const icon = this.page.getByRole('button', { name: 'Now Assist' }).or(this.nowAssistIconButton);
      if (await icon.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
        await icon.first().click();
      }
    }

    // Confirm chat input is ready
    await this.chatInput.waitFor({ state: 'visible', timeout: 60_000 });

    // Expand skill list if "Show more" button is visible
    const showMore = this.page.getByRole('button', { name: 'Show more' });
    if (await showMore.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await showMore.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Activate a specific Now Assist skill.
   *
   * On this instance, skills always appear as <li> text items in the intro
   * message — never as clickable buttons. The correct way to activate a skill
   * is to TYPE its exact name into the chat input and press Enter.
   */
  async clickSkill(skill: NowAssistSkill): Promise<void> {
    // Ensure the chat input is ready before typing.
    await this.chatInput.waitFor({ state: 'visible', timeout: 30_000 });
    await this.chatInput.fill(skill);
    await this.chatInput.press('Enter');
  }

  /**
   * Reset to a fresh Now Assist session (New chat), then activate the given skill.
   * This is the standard entry point for all individual skill tests.
   *
   * After "New chat" the panel shows the intro message with skill <li> items.
   * We activate the skill by typing its name into the chat input.
   */
  async startSkill(skill: NowAssistSkill): Promise<void> {
    await this.openSkillPicker();
    await this.clickSkill(skill);
    // Wait briefly for Now Assist to process the skill selection.
    await this.page.waitForTimeout(1_000);
  }

  // ── Messaging ────────────────────────────────────────────────────────────

  /**
   * Type a message into the Now Assist chat input and submit it.
   */
  async sendMessage(message: string): Promise<void> {
    await this.chatInput.fill(message);
    await this.chatInput.press('Enter');
  }

  /**
   * Wait for the Now Assist panel to produce an AI response after a message is sent.
   * Returns the text content of the last assistant message bubble.
   *
   * @param timeoutMs  How long to wait for a response (default: 90 s).
   */
  async waitForResponse(timeoutMs = RESPONSE_TIMEOUT_MS): Promise<string> {
    // Wait for at least one assistant bubble to appear.
    await this.lastAssistantMessage.waitFor({ state: 'visible', timeout: timeoutMs });

    // Give the streaming response a moment to finish rendering.
    await this.page.waitForTimeout(2_000);

    const text = await this.lastAssistantMessage.textContent() ?? '';
    return text.trim();
  }

  /**
   * Send a message and wait for a response. Returns the response text.
   */
  async sendAndWait(message: string, timeoutMs = RESPONSE_TIMEOUT_MS): Promise<string> {
    await this.sendMessage(message);
    return this.waitForResponse(timeoutMs);
  }

  // ── Table API record fetching helper ─────────────────────────────────────

  /**
   * Fetches an active incident record number directly via ServiceNow Table API
   * utilizing the authenticated browser session and CSRF token (g_ck).
   */
  async getLiveIncidentNumber(): Promise<string> {
    const recordNumber = await this.page.evaluate(async () => {
      try {
        const globalScope = globalThis as any;
        const token = globalScope.g_ck || '';
        const resp = await fetch('/api/now/table/incident?sysparm_limit=1&sysparm_fields=number&sysparm_query=ORDERBYDESCsys_created_on', {
          headers: {
            'Accept': 'application/json',
            'X-UserToken': token
          }
        });
        const data: any = await resp.json();
        return data?.result?.[0]?.number || 'INC0010040';
      } catch (e) {
        return 'INC0010040';
      }
    });
    return recordNumber;
  }

  // ── Skill-reading helpers ────────────────────────────────────────────────

  /**
   * Reads all visible skill button labels from the Now Assist panel at runtime.
   */
  async getVisibleSkills(): Promise<string[]> {
    await this.chatInput.waitFor({ state: 'visible', timeout: 30_000 });

    // In ServiceNow, skill tiles inside the Now Assist dialog render as buttons or list items.
    const ignoredButtons = new Set([
      'Show more', 'Show less', 'New chat', 'Send', 'Send Message',
      'Enter Modal', 'Unpin Now Assist', 'Close Now Assist', 'Chats',
      'Upload up to 3 files (max 5 MB each) to ask questions about their contents',
      'Submit', 'Show sources', ''
    ]);

    // Check button tiles inside dialog "Now Assist" / chat dialog
    const buttonElements = this.page.locator(
      'dialog[aria-label="Now Assist"] button, dialog[aria-label="Chat Dialog"] button, [data-role="chat-window"] button, now-va-chat-launcher button, now-chat-window button, button'
    );
    const btnCount = await buttonElements.count();
    if (btnCount > 0) {
      const labels = await buttonElements.allTextContents();
      const filtered = labels
        .map(t => t.trim())
        .filter(t => t.length > 0 && !ignoredButtons.has(t));
      const validSkills = filtered.filter(label => NOW_ASSIST_SKILLS.some(skill => label.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(label.toLowerCase())));
      if (validSkills.length > 0) return Array.from(new Set(validSkills));
      if (filtered.length > 0) return Array.from(new Set(filtered));
    }

    // Check list items
    const listItems = this.page.locator('now-va-chat-launcher li, now-chat-window li, .now-chat-message li, [data-role="chat-window"] li');
    const liCount = await listItems.count();
    if (liCount > 0) {
      const labels = await listItems.allTextContents();
      const filtered = labels.map(t => t.trim()).filter(t => t.length > 0);
      if (filtered.length > 0) return Array.from(new Set(filtered));
    }

    return [];
  }

  /**
   * Assert that a specific skill label is visible in the Now Assist panel (button or li item).
   */
  async assertSkillVisible(skill: NowAssistSkill): Promise<void> {
    const item = this.page.getByRole('button', { name: skill }).or(
      this.page.locator('dialog[aria-label="Now Assist"] button, dialog[aria-label="Chat Dialog"] button, now-va-chat-launcher button, now-chat-window button, li').filter({ hasText: skill })
    );
    await expect(item.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Assert all 9 known skills are visible.
   */
  async assertAllSkillsVisible(): Promise<void> {
    for (const skill of NOW_ASSIST_SKILLS) {
      await this.assertSkillVisible(skill);
    }
  }

  // ── File output ──────────────────────────────────────────────────────────

  /**
   * Write the list of available skill labels to a text file.
   */
  writeSkillsToFile(skills: string[], outPath?: string): void {
    const outputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filePath = outPath ?? path.join(outputDir, 'now-assist-skills.txt');
    const timestamp = new Date().toISOString();
    const lines = [
      `Now Assist — Available Skills`,
      `Captured: ${timestamp}`,
      `Instance: ${process.env.SN_INSTANCE_URL ?? 'unknown'}`,
      `─────────────────────────────────`,
      ...skills.map((s, i) => `${i + 1}. ${s}`),
      `─────────────────────────────────`,
      `Total: ${skills.length} skill(s)`,
    ];
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log(`📄 Skills written to ${filePath}`);
  }

  // ── Per-skill convenience wrappers ───────────────────────────────────────

  /** Start the "Get Help" skill and ask a question. Returns the response text. */
  async useGetHelp(question: string): Promise<string> {
    await this.startSkill('Get Help');
    return this.sendAndWait(question);
  }

  /** Start the "Summarize a record" skill with a record sys_id or number. */
  async useSummarizeRecord(recordRef: string): Promise<string> {
    await this.startSkill('Summarize a record');
    return this.sendAndWait(recordRef);
  }

  /** Start the "Summarize conversation" skill. Returns the response text. */
  async useSummarizeConversation(): Promise<string> {
    await this.startSkill('Summarize conversation');
    return this.waitForResponse();
  }

  /** Start the "Generate resolution notes" skill. Returns the response text. */
  async useGenerateResolutionNotes(): Promise<string> {
    await this.startSkill('Generate resolution notes');
    return this.waitForResponse();
  }

  /** Start the "generate a kb article" skill. Returns the response text. */
  async useGenerateKbArticle(): Promise<string> {
    await this.startSkill('generate a kb article');
    return this.waitForResponse();
  }

  /** Start the "Incident assist" skill. Returns the response text. */
  async useIncidentAssist(): Promise<string> {
    await this.startSkill('Incident assist');
    return this.waitForResponse();
  }

  /** Start the "Manage duplicate CIs" skill. Returns the response text. */
  async useManageDuplicateCIs(): Promise<string> {
    await this.startSkill('Manage duplicate CIs');
    return this.waitForResponse();
  }

  /** Start "Error Analysis and Remediation Workflow" skill. Returns response. */
  async useErrorAnalysisWorkflow(): Promise<string> {
    await this.startSkill('Error Analysis and Remediation Workflow');
    return this.waitForResponse();
  }

  /** Start "Suggest configuration items for a change request" skill. */
  async useSuggestConfigItems(): Promise<string> {
    await this.startSkill('Suggest configuration items for a change request');
    return this.waitForResponse();
  }
}
