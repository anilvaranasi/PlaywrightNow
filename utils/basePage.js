// utils/basePage.js
// Base class shared by all page objects.
// Wraps the Playwright `page` instance and exposes common helpers.

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to an absolute URL.
   * @param {string} url
   */
  async goto(url) {
    await this.page.goto(url);
  }

  /**
   * Wait for the page to reach a 'load' state.
   */
  async waitForLoad() {
    await this.page.waitForLoadState('load');
  }
}

module.exports = { BasePage };
