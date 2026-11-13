# Testes Playwright

Testes E2E do [Sauce Demo](https://www.saucedemo.com) com Playwright Test. A execução local e a pipeline do GitHub Actions usam Chromium.

## Requisitos

- Node.js 20 ou superior
- npm

## Executar

```bash
npm ci
npx playwright install chromium
npm test
```

O endereço padrão é `https://www.saucedemo.com`. Para apontar os testes a outro ambiente compatível, defina `BASE_URL`.

No PowerShell:

```powershell
$env:BASE_URL = "https://seu-ambiente.example"
npm test
```

Comandos adicionais:

```bash
npm run test:ui
npm run report
```

O relatório HTML é gerado em `playwright-report/` e os resultados e evidências em `test-results/`. Essas pastas são geradas durante a execução e não são versionadas.

## Estrutura dos testes

```text
tests/
  regression/
    ecommerce.spec.ts
    ecommerce.spec.ts-snapshots/
  users/
    error_user.spec.ts
    locked_out_user.spec.ts
    performance_glitch_user.spec.ts
    problem_user.spec.ts
    standard_user.spec.ts
    visual_user.spec.ts
    visual_user.spec.ts-snapshots/
```

O Playwright descobre os arquivos `.spec.ts` nas subpastas automaticamente. Para executar uma categoria específica:

```bash
npx playwright test tests/users
npx playwright test tests/regression
```

Os snapshots visuais existentes são para Chromium no Windows; a pipeline usa `windows-latest` para manter essa compatibilidade.

## Pipeline

O workflow único em `.github/workflows/playwright.yml` roda em push e pull request. Ele instala as dependências e o Chromium, executa `npm test` e publica o relatório HTML como artifact.
