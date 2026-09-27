// utils/loginPage.ts
// Page Object for the ServiceNow login screen.

import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(baseURL: string): Promise<void> {
    await this.goto(`${baseURL}/login.do`);
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.locator('#user_name').fill(username);
    await this.page.locator('#user_password').fill(password);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60_000 }),
      this.page.locator('#sysverb_login').click(),
    ]);
  }
}
