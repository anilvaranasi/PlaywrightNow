# `tests/example.spec.js`

Smoke test — verifies the ServiceNow instance is reachable and returns the login page.

---

## What it tests

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Navigate to `SN_INSTANCE_URL` | — |
| 2 | Check the page title | Title contains `Login` ✅ |

---

## Purpose

This is the **baseline connectivity check**. It answers:
> "Is the ServiceNow instance up and returning the expected page?"

It does **not** log in — it only checks that the login page loads. Useful as a pre-flight check before running the full suite.

---

## Authentication

None — this test intentionally visits the unauthenticated login page.  
Credentials are loaded from `NowConfig.env` but only `SN_INSTANCE_URL` is used.

> ⚠️ Note: this is a plain **JavaScript** (`.js`) spec. All newer tests in this project use **TypeScript** (`.ts`). This file is kept as a legacy smoke test reference.

---

## Run command

```bash
# Run just this test
npx playwright test tests/example.spec.js

# Or run the full suite (includes this test)
npm test
```

---

## Prerequisites

- `NowConfig.env` with `SN_INSTANCE_URL` set
- System Chrome installed
- Network access to the ServiceNow instance
