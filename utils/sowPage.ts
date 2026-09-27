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
    await this.page
      .getByRole('link', { name: /Service Operations Workspace/ })
      .click();
    await this.page.waitForLoadState('networkidle');
  }
}
