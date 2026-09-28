# `tests/servicenow-sow.spec.ts`

Opens the **Service Operations Workspace (SOW)** in ServiceNow using a pre-authenticated session.

---

## What it tests

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Navigate to `/now/nav/ui/home` using stored session | — |
| 2 | Click the **Workspaces** menu item in the Next Experience nav bar | — |
| 3 | Click the **Service Operations Workspace** link | — |
| 4 | Verify the workspace loaded | URL contains `/now/sow/` ✅ |

---

## How authentication works

This test does **not** log in itself. Authentication is handled by [`global-setup.ts`](../global-setup.ts):

```
global-setup.ts
  └─ Logs in once (headless) → saves cookies to .auth/storageState.json

playwright.config.ts
  └─ Injects storageState into every test's browser context

servicenow-sow.spec.ts
  └─ Browser starts already logged in — goes straight to the app
```

---

## Page Objects used

| Class | File | Responsibility |
|-------|------|----------------|
| `NavigationPage` | [`utils/navigationPage.ts`](../utils/navigationPage.ts) | `goToHome()` — navigates to the Next Experience shell |
| `NavigationPage` | [`utils/navigationPage.ts`](../utils/navigationPage.ts) | `openWorkspacesMenu()` — clicks the Workspaces nav item |
| `SOWPage` | [`utils/sowPage.ts`](../utils/sowPage.ts) | `open()` — clicks the SOW link, waits for URL change |

---

## Run command

```bash
npm run test:sow
```

---

## Key design decisions

- **`waitUntil: 'domcontentloaded'`** instead of `networkidle` — ServiceNow's Next Experience fires background polling XHRs indefinitely, so `networkidle` never resolves.
- **`waitForURL(/\/now\/sow\//)`** in `SOWPage.open()` — more reliable than `waitForLoadState` for SPA navigation.
- **`getByRole('menuitem')`** — shadow-DOM-safe locator; does not break across ServiceNow platform upgrades unlike CSS selectors.
- **`workers: 1`** in config — prevents session collision when running multiple tests against the same SN user account.

---

## Prerequisites

- `NowConfig.env` at project root with `SN_INSTANCE_URL`, `SN_USERNAME`, `SN_PASSWORD`
- `TIMEOUT_SECONDS=90` (or higher) — SN Next Experience needs time to render
- System Chrome installed
