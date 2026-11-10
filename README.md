# Playwright QA Automation Framework

Framework de testes E2E para o Sauce Demo, usando Playwright Test e GitHub Actions.

## Requisitos

- Node.js 20 ou superior
- npm

## Início rápido

```bash
npm ci
npx playwright install
npm test
```

O `playwright.config.ts` usa `https://www.saucedemo.com` como URL padrão. Para testar outro ambiente, defina `BASE_URL`.

### Scripts npm

| Comando | Descrição |
|---|---|
| `npm test` | Executa todos os projetos e testes |
| `npm run test:ui` | Abre a interface interativa do Playwright |
| `npm run test:headed` | Executa os browsers com interface visível |
| `npm run test:debug` | Abre o depurador do Playwright |
| `npm run test:chromium` | Executa o projeto Chromium |
| `npm run test:firefox` | Executa o projeto Firefox |
| `npm run test:webkit` | Executa o projeto WebKit |
| `npm run test:mobile` | Executa Mobile Chrome e Mobile Safari |
| `npm run test:visual` | Executa testes com a tag `@visual` |
| `npm run test:performance` | Executa testes com a tag `@performance` |
| `npm run test:ci` | Executa Playwright com reporters de CI |
| `npm run report` | Abre o relatório HTML existente |
| `npm run lint` | Executa ESLint localmente |
| `npm run typecheck` | Executa `tsc --noEmit` |

Para instalar apenas browsers específicos:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Estrutura

```text
.github/
  dependabot.yml
  dependency-review-config.yml
  workflows/
    dependency-review.yml
    playwright.yml
tests/
  ecommerce.spec.ts
  error_user.spec.ts
  locked_out_user.spec.ts
  performance_glitch_user.spec.ts
  problem_user.spec.ts
  standard_user.spec.ts
  visual_user.spec.ts
playwright.config.ts
package.json
```

## Projetos Playwright

O Playwright está configurado para executar nos seguintes projetos:

- Desktop: Chromium, Firefox e WebKit
- Mobile: Mobile Chrome (Pixel 5) e Mobile Safari (iPhone 12)

No CI, a matriz desktop executa Chromium em dois shards e Firefox/WebKit em um shard cada. Os testes visuais, de performance e mobile são executados em jobs separados para evitar execução duplicada.

## Tags e execução local

| Tag | Uso |
|---|---|
| `@smoke` | Fluxos críticos |
| `@regression` | Cenários de regressão |
| `@visual` | Comparação de screenshots |
| `@performance` | Verificações de tempo de resposta/carregamento |
| `@mobile` | Cenários específicos de viewport mobile |
| `@api` | Verificações de requisição HTTP |

Exemplos:

```bash
npx playwright test --grep="@smoke"
npx playwright test --grep="@visual" --project=chromium
npx playwright test --grep="@performance" --project=chromium
npx playwright test --grep="@mobile" --project="Mobile Chrome"
```

Para atualizar screenshots de referência localmente no PowerShell:

```powershell
$env:PLAYWRIGHT_UPDATE_SNAPSHOTS = "1"
npx playwright test --grep="@visual" --project=chromium
Remove-Item Env:PLAYWRIGHT_UPDATE_SNAPSHOTS
```

Confira as imagens atualizadas antes de incluí-las no repositório. Os snapshots atuais usam a plataforma Chromium/Windows (`*-chromium-win32.png`); por isso o job visual do GitHub Actions roda em `windows-latest`.

## Configuração

| Variável | Descrição | Padrão |
|---|---|---|
| `BASE_URL` | URL base do sistema sob teste | `https://www.saucedemo.com` |
| `CI` | Ativa configurações de CI, incluindo retries | Definida automaticamente no GitHub Actions |
| `TEST_ENV` | Nome do ambiente incluído nos metadados | `local` |

No PowerShell, defina `BASE_URL` assim:

```powershell
$env:BASE_URL = "https://seu-ambiente.example"
npm test
```

Configurações relevantes do Playwright:

- execução paralela dos arquivos de teste;
- dois retries no CI e nenhum retry local;
- `forbidOnly` no CI para evitar `test.only` acidental;
- trace na primeira repetição, screenshot em falhas e vídeo retido em falhas;
- reporters line/GitHub e blob nos jobs de teste; o job agregado gera o HTML final.

## GitHub Actions

O workflow principal está em `.github/workflows/playwright.yml`.

### Quando executa

- Push e pull request para `main`, `master` ou `develop`;
- execução agendada toda segunda-feira às 12:00 UTC;
- execução manual por `workflow_dispatch`, com escolha de `staging` ou `production`.

### Jobs

1. **Quality Gates** — executa ESLint, TypeScript, `npm audit` e verificação de pacotes desatualizados. Atualmente essas verificações são não bloqueantes (`continue-on-error`/`|| true`); falhas são reportadas, mas não impedem os testes seguintes.
2. **Desktop tests** — Chromium (dois shards), Firefox e WebKit; exclui as tags `@visual`, `@performance` e `@mobile`.
3. **Mobile tests** — executa apenas testes `@mobile` nos projetos Mobile Chrome e Mobile Safari.
4. **Visual regression** — executa os testes `@visual` em pull requests não rascunho, no Windows, para corresponder aos snapshots versionados.
5. **Performance** — executa os testes `@performance` no Chromium em execuções agendadas ou manuais.
6. **Aggregate Reports** — baixa e combina os relatórios blob gerados pelos jobs em um relatório HTML.
7. **Notify** — pode publicar no Slack se `SLACK_WEBHOOK_URL` estiver configurado e comenta em pull requests do mesmo repositório, exceto pull requests do Dependabot.
8. **Deploy staging/production** — os jobs estão apenas como placeholders: no momento imprimem uma mensagem e **não fazem deploy real**. A produção exige execução manual com o ambiente `production`, além do sucesso dos testes desktop e mobile.

Os resultados, traces e relatórios são publicados como artifacts na execução do workflow. Os relatórios blob intermediários são mantidos por 1 dia; os relatórios finais e resultados são mantidos por até 30 dias, conforme cada job.

### Revisão de dependências

O workflow `.github/workflows/dependency-review.yml` roda em pull requests e usa `.github/dependency-review-config.yml` para bloquear vulnerabilidades de severidade alta ou crítica e restringir as licenças permitidas.

Para a action Dependency Review funcionar, habilite o **Dependency graph** nas configurações de segurança do repositório, em **Settings → Advanced Security** (ou **Code security and analysis**, dependendo da interface). A revisão pode não estar disponível em algumas contas/planos.

### Dependabot

`.github/dependabot.yml` configura atualizações semanais para dependências npm e GitHub Actions. Atualizações major de npm estão ignoradas; atualizações major de GitHub Actions continuam permitidas.

## Relatórios e depuração

```bash
npm run report
npx playwright show-trace caminho/para/trace.zip
npx playwright test --debug --grep="login"
npx playwright test --shard=1/2
npx playwright test --shard=2/2
```

Para combinar relatórios blob criados localmente:

```bash
npx playwright merge-reports --reporter=html blob-report
```

## Referências

- [Documentação do Playwright](https://playwright.dev/docs/intro)
- [Configuração de testes](https://playwright.dev/docs/test-configuration)
- [Playwright no CI](https://playwright.dev/docs/ci)
- [Testes visuais](https://playwright.dev/docs/test-snapshots)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
