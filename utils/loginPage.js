// utils/loginPage.js
// Page Object for the ServiceNow login screen.

const { BasePage } = require('./basePage');

class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    this.usernameInput = page.getByRole('textbox', { name: 'User name' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton   = page.getByRole('button',  { name: 'Log in' });
  }

  /**
   * Navigate to the login page.
   * @param {string} baseURL
   */
  async navigate(baseURL) {
    await this.goto(`${baseURL}/login.do`);
  }

  /**
   * Fill credentials and submit the login form.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.usernameInput.press('Tab');
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForLoad();
  }
}

module.exports = { LoginPage };
