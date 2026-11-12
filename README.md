# playwright-e2e-saucedemo

Framework de testes E2E para o [Sauce Demo](https://www.saucedemo.com), usando Playwright Test e GitHub Actions.

Os cenários cobrem autenticação, catálogo de produtos, carrinho e checkout, além de testes visuais, verificações de desempenho, cenários mobile e chamadas de API. Há também testes para os usuários de demonstração `standard_user`, `locked_out_user`, `problem_user`, `error_user`, `visual_user` e `performance_glitch_user`.

## Requisitos

- Node.js 20 ou superior
- npm

## Início rápido

```bash
npm ci
npx playwright install chromium
npm test -- --project=chromium
```

O Playwright usa `https://www.saucedemo.com` como URL padrão e precisa de acesso à internet para abrir o site. Para testar outro ambiente compatível, defina `BASE_URL`.
Sem `--project=chromium`, `npm test` executa os cinco projetos configurados; os snapshots visuais versionados, porém, existem apenas para Chromium no Windows.

No PowerShell:

```powershell
$env:BASE_URL = "https://seu-ambiente.example"
npm test
```

### Scripts npm

| Comando | Descrição |
|---|---|
| `npm test` | Executa todos os projetos e testes; veja a limitação dos snapshots visuais abaixo |
| `npm run test:ui` | Abre a interface interativa do Playwright |
| `npm run test:headed` | Executa os browsers com interface visível |
| `npm run test:debug` | Abre o depurador do Playwright |
| `npm run test:chromium` | Executa o projeto Chromium |
| `npm run test:firefox` | Executa o projeto Firefox |
| `npm run test:webkit` | Executa o projeto WebKit |
| `npm run test:mobile` | Executa Mobile Chrome e Mobile Safari |
| `npm run test:visual -- --project=chromium` | Executa testes `@visual` no Chromium |
| `npm run test:performance` | Executa testes com a tag `@performance` |
| `npm run test:ci` | Executa os testes com reporters line, GitHub e HTML |
| `npm run test:shard` | Executa apenas a primeira metade da suíte (shard 1/2) |
| `npm run report` | Abre o relatório HTML existente |
| `npm run report:merge` | Combina relatórios blob previamente gerados |
| `npm run lint` | Executa ESLint localmente |
| `npm run lint:fix` | Corrige automaticamente problemas suportados pelo ESLint |

Para instalar browsers adicionais para executar outros projetos:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

## Estrutura

```text
.github/
  dependabot.yml
  workflows/
    playwright.yml
tests/
  ecommerce.spec.ts
  error_user.spec.ts
  global-setup.ts
  global-teardown.ts
  locked_out_user.spec.ts
  performance_glitch_user.spec.ts
  problem_user.spec.ts
  standard_user.spec.ts
  visual_user.spec.ts
  ecommerce.spec.ts-snapshots/
  visual_user.spec.ts-snapshots/
playwright.config.ts
package.json
package-lock.json
README.md
```

As pastas `test-results/`, `playwright-report/` e `blob-report/` contêm resultados gerados durante a execução e não são versionadas. Os arquivos de setup e teardown existem, mas ainda não estão habilitados no `playwright.config.ts`.

## Projetos Playwright

O Playwright está configurado para executar em cinco projetos:

- Desktop: Chromium, Firefox e WebKit
- Mobile: Mobile Chrome (Pixel 5) e Mobile Safari (iPhone 12)

O CI executa todos os arquivos de teste no projeto Chromium. Para executar Firefox, WebKit ou os projetos mobile localmente, use `npm test -- --project=firefox`, `npm test -- --project=webkit`, `npm test -- --project="Mobile Chrome"` ou `npm test -- --project="Mobile Safari"`. A execução de testes visuais nesses projetos requer snapshots de referência correspondentes, que ainda não estão versionados.

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
npx playwright test --grep="@api"
```

O cenário `Login API validation` está marcado como ignorado (`test.skip`) no momento. Os testes de screenshot usam referências versionadas nas pastas `*-snapshots`; atualize-as somente após revisar as diferenças.

Para atualizar screenshots de referência localmente no PowerShell:

```powershell
$env:PLAYWRIGHT_UPDATE_SNAPSHOTS = "1"
npx playwright test --grep="@visual" --project=chromium
Remove-Item Env:PLAYWRIGHT_UPDATE_SNAPSHOTS
```

Confira as imagens atualizadas antes de incluí-las no repositório. Os snapshots atuais usam a plataforma Chromium/Windows (`*-chromium-win32.png`); por isso o GitHub Actions roda em `windows-latest`.

## Configuração

| Variável | Descrição | Padrão |
|---|---|---|
| `BASE_URL` | URL base do sistema sob teste | `https://www.saucedemo.com` |
| `CI` | Ativa configurações de CI, incluindo retries | Definida automaticamente no GitHub Actions |
| `TEST_ENV` | Nome do ambiente incluído nos metadados do relatório | `local` |

Configurações relevantes do Playwright:

- execução paralela dos arquivos de teste;
- até dois retries no CI e nenhum retry local;
- `forbidOnly` no CI para evitar `test.only` acidental;
- trace na primeira repetição, screenshot em falhas e vídeo retido em falhas;
- no CI, reporters line/GitHub e HTML em `playwright-report/`.

O workflow define `CI=true` automaticamente. Para simular localmente no PowerShell:

```powershell
$env:CI = "true"
npm test
Remove-Item Env:CI
```

## GitHub Actions

O workflow principal está em `.github/workflows/playwright.yml`.

### O que mudou

- O workflow roda em cada push e pull request, em qualquer branch.
- Um único job no `windows-latest` instala as dependências e o Chromium e executa todos os arquivos de teste com `npx playwright test --project=chromium`.
- O Windows mantém a compatibilidade com os snapshots Chromium/Windows versionados.
- Foram removidos os jobs separados e a matriz de browsers, a revisão de dependências, notificações, agregação de relatórios e deploys de exemplo.

### Acessar o relatório

Após a execução, baixe o artifact `playwright-report` na página do workflow em **Actions**. O artifact é mantido por 30 dias e é enviado mesmo quando os testes falham, desde que o relatório tenha sido gerado. Para abri-lo localmente, extraia o artifact na raiz do projeto e execute:

```bash
npm run report
```

O workflow atualmente executa os testes; ele não roda lint/typecheck, não publica notificações e não faz deploy.
O relatório HTML é gerado diretamente pelo Playwright; o workflow não cria relatórios blob nem combina relatórios de vários jobs.

### Dependabot

`.github/dependabot.yml` continua configurando atualizações semanais para dependências npm e GitHub Actions. Atualizações major de npm estão ignoradas.

## Limitações conhecidas

- `npm run typecheck` está definido no `package.json`, mas ainda não há `tsconfig.json`; por isso, o comando não verifica os arquivos TypeScript.
- O teste de validação da API de login está ignorado (`test.skip`).
- Os snapshots visuais existentes são apenas para Chromium no Windows. Para comparar visualmente em outros projetos ou sistemas operacionais, é necessário gerar e revisar os snapshots correspondentes.
- O alvo padrão é o Sauce Demo público; não há aplicação local ou servidor de desenvolvimento neste repositório.

## Relatórios e depuração

```bash
npm run report
npx playwright show-trace caminho/para/trace.zip
npx playwright test --debug --grep="login"
```

`npm run report:merge` só é útil quando existem relatórios blob; o workflow atual gera um único relatório HTML e não produz blobs.

## Referências

- [Documentação do Playwright](https://playwright.dev/docs/intro)
- [Configuração de testes](https://playwright.dev/docs/test-configuration)
- [Playwright no CI](https://playwright.dev/docs/ci)
- [Testes visuais](https://playwright.dev/docs/test-snapshots)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
