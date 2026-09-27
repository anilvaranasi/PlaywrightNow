// utils/navigationPage.js
// Page Object for the ServiceNow top-level navigation bar.

const { BasePage } = require('./basePage');

class NavigationPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.workspacesMenu = page.getByRole('menuitem', { name: 'Workspaces' });
  }

  /**
   * Navigate to the ServiceNow home UI.
   * @param {string} baseURL
   */
  async goToHome(baseURL) {
    await this.goto(`${baseURL}/now/nav/ui/home`);
    await this.waitForLoad();
  }

  /**
   * Open the Workspaces menu item in the nav bar.
   */
  async openWorkspacesMenu() {
    await this.workspacesMenu.click();
  }
}

module.exports = { NavigationPage };
