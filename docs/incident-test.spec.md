# `tests/incident-test.spec.ts`

Creates a new **Incident** record in ServiceNow via the classic UI form and verifies successful submission.

---

## What it tests

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Navigate to `incident.do?sys_id=-1` (new record form) | — |
| 2 | Wait for the classic iframe form to render | — |
| 3 | Fill **Short Description** field | — |
| 4 | Set **Urgency** to Medium (value `2`) | — |
| 5 | Click **Submit** | — |
| 6 | Verify record was saved | URL no longer contains `sys_id=-1` ✅ |
| 7 | Verify Short Description persisted | Field value matches input ✅ |
| 8 | Verify Urgency persisted | Field value = `2` ✅ |

---

## How authentication works

Session is injected by `playwright.config.ts` via `storageState` — see [`global-setup.ts`](../global-setup.ts).  
No login steps appear in this spec.

---

## Page Objects used

| Class | File | Methods used |
|-------|------|--------------|
| `ServiceNowPage` | [`utils/servicenow-page.ts`](../utils/servicenow-page.ts) | `goto()`, `waitForClassicForm()`, `inClassicFrame()`, `selectField()`, `waitForClientScripts()`, `submitForm()` |

---

## ServiceNow-specific patterns

### Classic UI iframe
All Incident form fields live inside `<iframe id="gsft_main">`. Direct `page.locator()` calls find nothing — every field interaction must go through `inClassicFrame()` which uses `page.frameLocator('#gsft_main')`.

### Field ID convention
ServiceNow classic form field IDs follow `<table>.<field>`:
```
#incident.short_description
#incident.urgency
#incident.caller_id
```
These IDs are stable across platform upgrades and are preferred over labels or custom attributes.

### Client script idle waits
Changing a field (e.g. Urgency) triggers `GlideAjax` calls that asynchronously update dependent fields (e.g. Priority). `waitForClientScripts()` waits for `networkidle` to ensure these settle before the next interaction.

### Submit button
New record forms use `#sysverb_insert`. Update forms use `#sysverb_update`. `submitForm()` targets both with a CSS comma list.

---

## Run command

```bash
npm run test:incident
```

---

## Constants (easy to change)

| Constant | Value | Location |
|----------|-------|----------|
| `INCIDENT_FORM_PATH` | `incident.do?sys_id=-1` | Top of spec |
| `SHORT_DESCRIPTION` | `Automated test — Playwright incident creation` | Top of spec |
| `URGENCY_VALUE` | `2` (Medium) | Top of spec |

---

## Prerequisites

- `NowConfig.env` at project root with valid credentials
- `TIMEOUT_SECONDS=90` or higher
- System Chrome installed
- User account must have permission to create Incident records
