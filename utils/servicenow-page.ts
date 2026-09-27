// utils/servicenow-page.ts
// Base Page Object Model for ServiceNow.
//
// ServiceNow UI has three distinct rendering layers that require different
// locator strategies:
//
//  1. Classic UI  — rendered inside an <iframe id="gsft_main">.
//                   Standard Playwright locators do NOT pierce iframes
//                   automatically; you must use frameLocator() first.
//
//  2. Next Experience (Polaris / Now UI) — a single-page app that renders
//                   components inside Shadow DOMs. Playwright's locator()
//                   pierces open Shadow DOMs automatically, but you must
//                   NOT use CSS child combinators (>) across shadow roots.
//
//  3. Ambiguous   — some pages show both layers simultaneously (e.g. the
//                   classic form embedded inside a Next Experience shell).
//
// This base class exposes helpers for all three layers plus ServiceNow-
// specific patterns like reference fields and client-script idle waits.

import { Page, FrameLocator, Locator, Response } from '@playwright/test';

export class ServiceNowPage {
  protected readonly page: Page;

  // Lazily resolved FrameLocator for the classic UI iframe.
  // Typed as FrameLocator | null so we can cache it after first resolution.
  private _classicFrame: FrameLocator | null = null;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigate to a ServiceNow path relative to the instance base URL.
   * Waits for 'networkidle' so all post-navigation client scripts finish.
   *
   * @example await sn.goto('incident.do');
   * @example await sn.goto('now/sow/home');
   */
  async goto(relativePath: string): Promise<Response | null> {
    return this.page.goto(relativePath, { waitUntil: 'networkidle' });
  }

  // ── Classic UI iframe helpers ───────────────────────────────────────────────

  /**
   * Returns a FrameLocator scoped to the classic UI <iframe id="gsft_main">.
   *
   * ServiceNow wraps all classic (non-Next Experience) forms and lists inside
   * this iframe. Any interaction with form fields like #incident.short_description
   * must go through this frame — direct page.locator() calls on those IDs will
   * silently find nothing because they live in a different browsing context.
   */
  get classicFrame(): FrameLocator {
    if (!this._classicFrame) {
      this._classicFrame = this.page.frameLocator('#gsft_main');
    }
    return this._classicFrame;
  }

  /**
   * Locate an element inside the classic UI iframe by CSS selector.
   * Shorthand for this.classicFrame.locator(selector).
   *
   * @example const field = sn.inClassicFrame('#incident.short_description');
   */
  inClassicFrame(selector: string): Locator {
    return this.classicFrame.locator(selector);
  }

  // ── Next Experience / Shadow DOM helpers ────────────────────────────────────

  /**
   * Locate an element in the Next Experience UI.
   * Playwright's locator() already pierces open Shadow DOMs, so this is a
   * semantic wrapper — it signals intent and uses role/label/text locators
   * which are shadow-DOM-safe (unlike CSS selectors with > combinators).
   *
   * @example const btn = sn.inNextExperience('button', { name: 'Submit' });
   */
  inNextExperience(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  // ── Reference field helpers ─────────────────────────────────────────────────

  /**
   * Fill a ServiceNow reference field (a.k.a. lookup field).
   *
   * Reference fields are two-part widgets:
   *   - A text input that accepts free text and triggers an autocomplete search.
   *   - A magnifying-glass icon button that opens a full record picker popup.
   *
   * Strategy: type the search value into the input, wait for the autocomplete
   * dropdown to appear, then click the first matching option. This avoids
   * opening the popup window which is harder to drive with Playwright.
   *
   * @param fieldId  The bare field name, e.g. 'caller_id' or 'assignment_group'.
   *                 The input element id follows the pattern: <table>.<field>.
   *                 Provide the full id string, e.g. 'incident.caller_id'.
   * @param value    The string to search for in the reference field.
   */
  async fillReferenceField(fieldId: string, value: string): Promise<void> {
    const input = this.inClassicFrame(`#${fieldId}`);

    // Clear then type — reference fields sometimes have a hidden value that
    // must be cleared before the autocomplete fires correctly.
    await input.clear();
    await input.fill(value);

    // Wait for ServiceNow's autocomplete dropdown to appear.
    // The dropdown renders as a div with class 'ac_results' in classic UI.
    const dropdown = this.classicFrame.locator('.ac_results li').first();
    await dropdown.waitFor({ state: 'visible', timeout: 15_000 });
    await dropdown.click();
  }

  // ── Select field helper ─────────────────────────────────────────────────────

  /**
   * Select a value from a ServiceNow <select> element (e.g. Urgency, State).
   *
   * ServiceNow select fields have IDs in the format <table>.<field>,
   * e.g. 'incident.urgency'. Pass the full id.
   *
   * @param fieldId  Full id of the select element, e.g. 'incident.urgency'.
   * @param value    The option value (not the display label), e.g. '1' for High.
   */
  async selectField(fieldId: string, value: string): Promise<void> {
    await this.inClassicFrame(`#${fieldId}`).selectOption(value);
  }

  // ── Wait utilities ──────────────────────────────────────────────────────────

  /**
   * Wait until ServiceNow client scripts are idle.
   *
   * ServiceNow fires many glide.ajax and GlideRecord calls when a form loads
   * or a field changes. These async operations update other fields (e.g. setting
   * Assignment Group when Caller changes) and can cause flakiness if you
   * interact with target fields before they settle.
   *
   * Strategy: wait for network idle (no XHR for 500 ms) which is the most
   * reliable cross-version signal that SN client scripts have finished.
   */
  async waitForClientScripts(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific ServiceNow form to be fully loaded inside the classic
   * iframe by checking for the presence of the form's table name in the DOM.
   *
   * @param tableName  The SN table name, e.g. 'incident', 'sc_request'.
   */
  async waitForClassicForm(tableName: string): Promise<void> {
    // The classic form root element carries a 'data-tablename' or an id that
    // starts with the table name. We check for the main content wrapper.
    await this.inClassicFrame(`#${tableName}\\.short_description, form#${tableName}_form`)
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 });
  }

  // ── Form submission ─────────────────────────────────────────────────────────

  /**
   * Click the standard ServiceNow form Submit button inside the classic frame.
   * Waits for network idle after submission so redirect/confirmation loads fully.
   */
  async submitForm(): Promise<void> {
    // The Submit button on classic forms has id 'sysverb_insert' (new record)
    // or 'sysverb_update' (existing record). We target both with a CSS comma list.
    await this.inClassicFrame('#sysverb_insert, #sysverb_insert_bottom').first().click();
    await this.waitForClientScripts();
  }
}
