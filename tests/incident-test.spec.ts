// tests/incident-test.spec.ts
// Boilerplate: Create a new Incident record in ServiceNow.
//
// Prerequisites:
//   - global-setup.ts has run and saved .auth/storageState.json.
//   - playwright.config.ts sets storageState so this test starts logged in.
//   - IBMSGConfig.env is present at the project root with valid credentials.

import { test, expect } from '@playwright/test';
import { ServiceNowPage } from '../utils/servicenow-page';

// ── Constants ───────────────────────────────────────────────────────────────
// Keep magic strings in one place so they're easy to update if the instance
// changes version or the form fields are reconfigured.
const INCIDENT_FORM_PATH = 'incident.do?sys_id=-1';  // sys_id=-1 = new record
const SHORT_DESCRIPTION  = 'Automated test — Playwright incident creation';

// Urgency option values in ServiceNow:
//   1 = High, 2 = Medium, 3 = Low
const URGENCY_VALUE = '2';

test.describe('Incident Management', () => {

  test('Create a new Incident and verify submission', async ({ page }) => {
    const sn = new ServiceNowPage(page);

    // ── Step 1: Navigate to the Incident form ──────────────────────────────
    // 'networkidle' ensures SN's form client scripts finish loading before
    // we start interacting with fields. Without this, onChange handlers that
    // auto-populate fields (e.g. impact from urgency) may not be registered yet.
    await sn.goto(INCIDENT_FORM_PATH);

    // Wait for the classic iframe form to be ready.
    // The iframe can take several seconds to fully render on first load.
    await sn.waitForClassicForm('incident');

    // ── Step 2: Fill Short Description ────────────────────────────────────
    // ServiceNow classic form input IDs follow the convention: <table>.<field>
    // e.g. incident.short_description. Using this over custom data attributes
    // or text labels because it is stable across SN platform upgrades.
    await sn.inClassicFrame('#incident\\.short_description').fill(SHORT_DESCRIPTION);

    // Let client scripts react to the field change before moving on.
    await sn.waitForClientScripts();

    // ── Step 3: Set Urgency ────────────────────────────────────────────────
    // Urgency is a <select> element. We use our selectField helper which
    // targets the element by its ServiceNow ID convention.
    await sn.selectField('incident.urgency', URGENCY_VALUE);

    // Wait again — changing Urgency can trigger GlideAjax calls to recalculate
    // Priority, which updates other fields asynchronously.
    await sn.waitForClientScripts();

    // ── Step 4: Submit the form ────────────────────────────────────────────
    // submitForm() clicks #sysverb_insert (the Save/Submit button for new
    // records) and waits for the resulting page load + network idle.
    await sn.submitForm();

    // ── Step 5: Verify submission succeeded ───────────────────────────────
    // After a successful insert, ServiceNow redirects to the saved record
    // using its sys_id in the URL — it will no longer say sys_id=-1.
    // We also verify the Short Description value is present on the saved form,
    // confirming the correct record was created.

    // URL should no longer contain the 'new record' sys_id placeholder.
    await expect(page).not.toHaveURL(/sys_id=-1/);

    // The saved Short Description should appear in the form field.
    await expect(
      sn.inClassicFrame('#incident\\.short_description')
    ).toHaveValue(SHORT_DESCRIPTION);

    // Optionally assert the Urgency was saved correctly.
    await expect(
      sn.inClassicFrame('#incident\\.urgency')
    ).toHaveValue(URGENCY_VALUE);

    // Log the URL of the created record for traceability.
    console.log(`✅ Incident created — record URL: ${page.url()}`);
  });

});
