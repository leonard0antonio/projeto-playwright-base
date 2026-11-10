# Playwright QA Automation Framework

Framework de automação de testes E2E com Playwright, configurado com pipeline **Senior QA** para CI/CD.

## 🚀 Quick Start

```bash
# Install dependencies
npm ci

# Install browsers
npm run install:browsers

# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run specific project
npm run test:chromium
npm run test:mobile
npm run test:visual
npm run test:performance
```

## 📁 Project Structure

```
├── .github/
│   ├── workflows/
│   │   ├── playwright.yml          # Main CI/CD pipeline
│   │   └── dependency-review.yml   # Security scanning
│   └── dependabot.yml              # Automated dependency updates
├── tests/
│   ├── ecommerce.spec.ts           # Main test suite
│   ├── global-setup.ts             # Global setup hook
│   └── global-teardown.ts          # Global teardown hook
├── playwright.config.ts            # Playwright configuration
├── .eslintrc.json                  # ESLint configuration
└── package.json
```

## 🏷️ Test Tags

| Tag | Description | When Runs |
|-----|-------------|-----------|
| `@smoke` | Critical path tests | Every PR, push |
| `@regression` | Full regression suite | Merge to main/develop |
| `@visual` | Visual regression | PRs (non-draft) |
| `@performance` | Performance benchmarks | Schedule, manual |
| `@mobile` | Mobile viewport tests | Every PR |
| `@api` | API-level tests | Every PR |

### Running by Tag

```bash
# Run only smoke tests
npx playwright test --grep="@smoke"

# Run visual regression (updates snapshots)
PLAYWRIGHT_UPDATE_SNAPSHOTS=1 npx playwright test --grep="@visual"

# Run performance tests
npx playwright test --grep="@performance"
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `https://www.saucedemo.com` |
| `TEST_ENV` | Test environment name | `local` |
| `CI` | CI mode flag | Auto-detected |
| `PLAYWRIGHT_UPDATE_SNAPSHOTS` | Update visual snapshots | `false` |

### Playwright Config Highlights

- **Parallel execution**: `fullyParallel: true`
- **Smart retries**: 2 retries on CI, 0 locally
- **Sharding support**: For large test suites
- **Multiple reporters**: line, github, html
- **Trace collection**: On first retry
- **Screenshots/Video**: On failure only

## 🔄 CI/CD Pipeline

### Jobs Overview

```
quality-gates (lint, typecheck, audit)
    ↓
test (chromium x2 shards, firefox, webkit) ← parallel
    ↓
test-mobile (Mobile Chrome, Mobile Safari) ← parallel
    ↓
visual-regression (chromium @visual) ← PRs only
    ↓
performance (chromium @performance) ← schedule/manual
    ↓
aggregate-reports (merge all reports)
    ↓
notify (Slack, PR comment)
    ↓
deploy-staging (on develop branch success)
    ↓
deploy-production (manual approval)
```

### Pipeline Features

- ✅ **Quality Gates**: ESLint, TypeScript, npm audit
- ✅ **Matrix Strategy**: Multi-browser, multi-node
- ✅ **Sharding**: Parallel test execution
- ✅ **Caching**: Node modules, Playwright browsers
- ✅ **Artifacts**: Test results, traces, HTML reports
- ✅ **Visual Regression**: Screenshot comparison
- ✅ **Performance**: Load time benchmarks
- ✅ **Mobile Testing**: Real device viewports
- ✅ **Dependency Review**: Security scanning
- ✅ **Dependabot**: Automated updates
- ✅ **Notifications**: Slack, PR comments
- ✅ **Deployment Gates**: Staging/Production

## 📊 Reports

```bash
# View latest HTML report
npm run report

# Merge sharded reports
npm run report:merge
```

Reports include:
- Test results with screenshots/videos
- Trace viewer for debugging
- Performance metrics
- Visual regression diffs
- GitHub Actions annotations

## 🛡️ Quality Gates

### Pre-commit (Local)
```bash
npm run lint
npm run typecheck
```

### CI Pipeline
- ESLint with TypeScript rules
- TypeScript strict mode check
- npm audit (high+ vulnerabilities)
- Dependency review (licenses, CVEs)

## 🔧 Advanced Usage

### Debugging
```bash
# Debug specific test
npx playwright test --debug --grep="login"

# Headed mode
npx playwright test --headed

# Trace viewer
npx playwright show-trace trace.zip
```

### Sharding (Large Suites)
```bash
# Run shard 1 of 2
npx playwright test --shard=1/2

# Run shard 2 of 2
npx playwright test --shard=2/2
```

### Visual Regression
```bash
# Update baseline snapshots
PLAYWRIGHT_UPDATE_SNAPSHOTS=1 npx playwright test --grep="@visual"

# Compare with threshold
npx playwright test --grep="@visual"
```

## 📦 Dependencies

### Core
- `@playwright/test` - Test runner
- `@types/node` - TypeScript types

### Dev Tools
- `eslint` + `@typescript-eslint` - Linting
- `prettier` - Code formatting (recommended)

## 🤝 Contributing

1. Create feature branch
2. Write tests with appropriate tags
3. Run quality gates locally
4. Open PR - pipeline runs automatically
5. Address review comments
6. Merge after all checks pass

## 📚 Resources

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Test Configuration](https://playwright.dev/docs/test-configuration)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- [Visual Regression](https://playwright.dev/docs/test-snapshots)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)