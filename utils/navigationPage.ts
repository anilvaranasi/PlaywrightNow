// utils/navigationPage.ts
// Page Object for the ServiceNow top-level navigation bar (Next Experience UI).

import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goToHome(baseURL: string): Promise<void> {
    // ServiceNow's Next Experience shell fires background polling XHRs
    // indefinitely, so 'networkidle' never resolves. Use 'domcontentloaded'
    // to unblock as soon as the DOM is ready, then wait explicitly for the
    // nav bar to appear before interacting with it.
    await this.page.goto(`${baseURL}/now/nav/ui/home`, { waitUntil: 'domcontentloaded' });

    // Wait for the Workspaces menu item to be visible — this confirms the
    // Next Experience app shell has finished rendering its nav bar.
    await this.page.getByRole('menuitem', { name: 'Workspaces' }).waitFor({
      state: 'visible',
      timeout: 60_000,
    });
  }

  async openWorkspacesMenu(): Promise<void> {
    // The Workspaces menu item lives in the Next Experience nav bar which
    // renders inside a Shadow DOM. Playwright's getByRole() pierces it automatically.
    await this.page.getByRole('menuitem', { name: 'Workspaces' }).click();
  }
}
