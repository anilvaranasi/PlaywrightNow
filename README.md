# PlaywrightNow

> Playwright E2E test automation suite for ServiceNow — TypeScript, Page Object Model, session-based authentication, Cucumber/Gherkin BDD.

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- Google Chrome installed (tests use system Chrome)
- Network access to your ServiceNow instance

---

## Setup

### 1. Clone the repo

**CMD**
```cmd
git clone https://github.com/anilvaranasi/PlaywrightNow.git
cd PlaywrightNow
```

**Bash**
```bash
git clone https://github.com/anilvaranasi/PlaywrightNow.git
cd PlaywrightNow
```

---

### 2. Install dependencies

**CMD / Bash**
```cmd
npm install
```

---

### 3. Configure environment

Copy the example env file and fill in your ServiceNow credentials:

**CMD**
```cmd
copy config\NowConfig.env.example NowConfig.env
```

**Bash**
```bash
cp config/NowConfig.env.example NowConfig.env
```

> ⚠️ `NowConfig.env` is listed in `.gitignore` and will **never** be committed.

Edit `NowConfig.env` and set:

| Variable | Description |
|----------|-------------|
| `SN_INSTANCE_URL` | Full URL of your ServiceNow instance |
| `SN_USERNAME` | Login username |
| `SN_PASSWORD` | Login password |
| `SN_WORKSPACE_PATH` | Workspace path within ServiceNow |
| `OUTPUT_FOLDER` | Where to write output artefacts |
| `TIMEOUT_SECONDS` | Per-test timeout in seconds (default: 90) |

---

## Project Structure

```
PlaywrightNow/
├── config/
│   └── NowConfig.env.example               # Safe template — copy to root as NowConfig.env
├── docs/                                    # Per-spec documentation
├── features/
│   ├── now-assist-skills.feature            # Gherkin: skills panel visibility
│   └── now-assist-skill-interactions.feature # Gherkin: individual skill launches
├── step-definitions/
│   ├── world.ts                             # Cucumber World (shared page/context)
│   ├── hooks.ts                             # Before/After browser lifecycle
│   ├── now-assist-skills.steps.ts           # Steps: skill panel scenarios
│   └── now-assist-skill-interactions.steps.ts # Steps: individual skill scenarios
├── tests/
│   ├── example.spec.js                      # Smoke test — login page reachable
│   ├── sow.spec.ts                          # Open Service Operations Workspace
│   ├── now-assist.spec.ts                   # Open Now Assist panel
│   ├── now-assist-skills.spec.ts            # Capture available Now Assist skills to file
│   ├── now-assist-skill-tests.spec.ts       # Launch each of the 9 skills individually
│   └── incident-test.spec.ts               # Create an Incident record
├── utils/
│   ├── basePage.ts                          # Shared base class
│   ├── navigationPage.ts                    # Next Experience nav bar
│   ├── sowPage.ts                           # Service Operations Workspace
│   ├── nowAssistPage.ts                     # Now Assist panel + all skill helpers
│   ├── loginPage.ts                         # Login form
│   └── servicenow-page.ts                   # Classic UI iframe helpers
├── output/
│   └── now-assist-skills.txt                # Live-captured list of 9 Now Assist skills
├── global-setup.ts                          # One-time headless login → storageState
├── playwright.config.ts                     # Playwright configuration
├── cucumber.config.js                       # Cucumber/BDD configuration
└── package.json
```

---

## How Authentication Works

Login runs **once** headlessly before any test via `global-setup.ts`. It saves cookies and session tokens to `.auth/storageState.json`. Every test then loads that file and starts **already logged in** — no test repeats the login flow.

```
global-setup.ts  →  .auth/storageState.json  →  injected into every test
```

---

## Running Tests

### Playwright specs

**CMD**
```cmd
npm test
npm run test:sow
npm run test:now-assist
npm run test:now-assist-skills
npm run test:skill-tests
npm run test:incident
```

**Bash**
```bash
npm test
npm run test:sow
npm run test:now-assist
npm run test:now-assist-skills
npm run test:skill-tests
npm run test:incident
```

| Script | Description |
|--------|-------------|
| `npm test` | Run all Playwright specs |
| `npm run test:sow` | Open Service Operations Workspace |
| `npm run test:now-assist` | Open Now Assist panel |
| `npm run test:now-assist-skills` | Capture available Now Assist skills to file |
| `npm run test:skill-tests` | Launch each of the 9 skills individually |
| `npm run test:incident` | Create an Incident record |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ui` | Open Playwright UI explorer |
| `npm run codegen` | Record a new test via browser |

---

### BDD / Gherkin (Cucumber)

**CMD**
```cmd
npm run test:bdd
npm run test:bdd:now-assist
npm run test:bdd:skills
```

**Bash**
```bash
npm run test:bdd
npm run test:bdd:now-assist
npm run test:bdd:skills
```

| Script | Description |
|--------|-------------|
| `npm run test:bdd` | Run all feature files |
| `npm run test:bdd:now-assist` | Run `@now-assist` tagged scenarios only |
| `npm run test:bdd:skills` | Run `@skills` tagged scenarios (individual skill launches) |

Cucumber output is written to `output/cucumber-report.json`.

---

## Output Files

| File | Description |
|------|-------------|
| `output/now-assist-skills.txt` | Live-captured list of Now Assist skills |
| `output/cucumber-report.json` | Cucumber BDD run report |
| `test-results/` | Screenshots, videos, traces (failure only) |
| `playwright-report/` | HTML test report |

---

## Contributing

**CMD**
```cmd
git checkout -b feature/my-test
```

**Bash**
```bash
git checkout -b feature/my-test
```

1. Add tests under `tests/` (Playwright) or `features/` (Gherkin)
2. Add shared helpers under `utils/`
3. Add step definitions under `step-definitions/`
4. Open a pull request targeting the `MyDev` branch

---

## Acknowledgements

This project draws inspiration from the approach described in:

> [Revolutionizing ServiceNow UI Testing with Playwright MCP — A Comprehensive Guide](https://medium.com/@Pradeep-kumar100/revolutionizing-servicenow-ui-testing-with-playwright-mcp-a-comprehensive-guide-c7550c9bbe81)
> by Pradeep Kumar

Key concepts adopted from that guide:
- Using Playwright MCP as a bridge between AI-assisted test generation and ServiceNow's complex DOM
- Shadow DOM piercing strategies for Next Experience UI components
- Session-based authentication via `storageState` to avoid repeated login flows

---

## License

ISC
