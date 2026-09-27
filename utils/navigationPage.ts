// utils/navigationPage.ts
// Page Object for the ServiceNow top-level navigation bar (Next Experience UI).

import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goToHome(baseURL: string): Promise<void> {
    await this.page.goto(`${baseURL}/now/nav/ui/home`, { waitUntil: 'networkidle' });
  }

  async openWorkspacesMenu(): Promise<void> {
    // The Workspaces menu item lives in the Next Experience nav bar which
    // renders inside a Shadow DOM. Playwright's getByRole() pierces it automatically.
    await this.page.getByRole('menuitem', { name: 'Workspaces' }).click();
  }
}
