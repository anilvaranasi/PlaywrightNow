# PlaywrightNow

Playwright-based end-to-end test automation suite for IBM ServiceNow environments.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- Google Chrome installed (tests run against the system Chrome)
- [Playwright](https://playwright.dev/) (installed via npm)

## Setup

1. **Clone the repo**
   `ash
   git clone https://github.com/anilvaranasi/PlaywrightNow.git
   cd PlaywrightNow
   `

2. **Install dependencies**
   `ash
   npm install
   `

3. **Configure environment**

   Copy the example env file and fill in your ServiceNow credentials:
   `ash
   cp config/IBMSGConfig.env.example IBMSGConfig.env
   `
   > ?? IBMSGConfig.env is listed in .gitignore and will never be committed.

## Project Structure

`
PlaywrightNow/
+-- config/
¦   +-- IBMSGConfig.env.example   # Safe template — copy to root as IBMSGConfig.env
+-- docs/                          # Documentation and test plans
+-- tests/
¦   +-- example.spec.js            # Example test — ServiceNow login page check
+-- utils/                         # Shared helpers and page-object utilities
+-- playwright.config.js           # Playwright global configuration
+-- package.json
+-- .gitignore
`

## Running Tests

| Command | Description |
|---------|-------------|
| 
pm test | Run all tests (headless) |
| 
pm run test:headed | Run with visible browser |
| 
pm run test:ui | Open Playwright UI mode |
| 
pm run codegen | Record a new test via browser |

## Configuration

All configuration is driven by environment variables loaded from IBMSGConfig.env:

| Variable | Description |
|----------|-------------|
| SN_INSTANCE_URL | Full URL of your ServiceNow instance |
| SN_USERNAME | Login username |
| SN_PASSWORD | Login password |
| SN_WORKSPACE_PATH | Workspace path within ServiceNow |
| OUTPUT_FOLDER | Where to write output artefacts |
| TIMEOUT_SECONDS | Per-test timeout in seconds (default: 30) |

## Contributing

1. Create a feature branch: git checkout -b feature/my-test
2. Add tests under 	ests/
3. Add shared helpers under utils/
4. Open a pull request

## License

ISC
