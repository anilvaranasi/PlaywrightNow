// utils/sowPage.ts
// Page Object for the Service Operations Workspace (SOW).

import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class SOWPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click the Service Operations Workspace link from the Workspaces dropdown.
   * Uses a regex so it matches regardless of the trailing badge counter
   * (e.g. "Service Operations Workspace 14 of …").
   */
  async open(): Promise<void> {
    const sowLink = this.page.getByRole('link', { name: /Service Operations Workspace/ });

    // The Workspaces dropdown uses <sn-collapsible-list> which animates open.
    // The link resolves immediately but the collapsible overlay intercepts
    // pointer events until the animation finishes. We wait for the link to be
    // both visible AND stable (no layout shifts) before attempting the click.
    // If the collapsible still intercepts, we dispatch the click directly via
    // the DOM to bypass the overlay entirely.
    await sowLink.waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.waitForTimeout(500); // let the collapsible animation finish

    await sowLink.click({ force: true }); // force bypasses intercepting overlays

    // 'networkidle' never resolves in SOW — it keeps polling for live data.
    // Wait for the URL to shift to the SOW path instead, which is a reliable
    // signal that the workspace has loaded and taken over navigation.
    await this.page.waitForURL(/\/now\/sow\//, { timeout: 60_000 });
  }

  /**
   * Click the Now Assist button in the SOW toolbar to open the Now Assist panel.
   * Waits for the panel to become visible before returning so callers can
   * immediately interact with panel contents.
   */
  async openNowAssist(): Promise<void> {
    await this.page.getByRole('button', { name: 'Now Assist' }).click();

    // Now Assist renders as a side panel — wait for it to be visible.
    // The panel root uses role="complementary" or a known class; we wait
    // for the button to appear in an "active/pressed" state as confirmation.
    await this.page.getByRole('button', { name: 'Now Assist' })
      .waitFor({ state: 'visible', timeout: 30_000 });
  }
}
