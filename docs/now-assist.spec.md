# `tests/now-assist.spec.ts`

Opens the **Now Assist panel** inside the Service Operations Workspace.

---

## What it tests

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Navigate to `/now/nav/ui/home` using stored session | — |
| 2 | Click the **Workspaces** menu item | — |
| 3 | Open **Service Operations Workspace** | URL contains `/now/sow/` |
| 4 | Click the **Now Assist** toolbar button | — |
| 5 | Verify the Now Assist panel is open | Button is visible ✅ |

---

## How authentication works

Session is injected by `playwright.config.ts` via `storageState` — see [`global-setup.ts`](../global-setup.ts).  
No login steps appear in this spec.

---

## Page Objects used

| Class | File | Methods used |
|-------|------|--------------|
| `NavigationPage` | [`utils/navigationPage.ts`](../utils/navigationPage.ts) | `goToHome()`, `openWorkspacesMenu()` |
| `SOWPage` | [`utils/sowPage.ts`](../utils/sowPage.ts) | `open()`, `openNowAssist()` |

---

## Run command

```cmd
npm run test:now-assist
```

---

## Key design decisions

- **`openNowAssist()` lives in `SOWPage`** — Now Assist is a SOW-level feature; keeping it in the SOW page object means one place to update if the button label or structure changes.
- **`getByRole('button', { name: 'Now Assist' })`** — shadow-DOM safe, stable across SN upgrades.
- **No hardcoded URLs or credentials** — all driven from `NowConfig.env`.

---

## Prerequisites

- `NowConfig.env` with `SN_INSTANCE_URL`, `SN_USERNAME`, `SN_PASSWORD`
- `TIMEOUT_SECONDS=90` or higher
- System Chrome installed
- User account must have Now Assist enabled in the ServiceNow instance
