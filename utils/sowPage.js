// utils/sowPage.js
// Page Object for the Service Operations Workspace (SOW).

const { BasePage } = require('./basePage');

class SOWPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    // Matches the SOW link regardless of the trailing counter (e.g. "14 of")
    this.sowLink = page.getByRole('link', { name: /Service Operations Workspace/ });
  }

  /**
   * Click the Service Operations Workspace link from the Workspaces menu.
   */
  async open() {
    await this.sowLink.click();
    await this.waitForLoad();
  }
}

module.exports = { SOWPage };
