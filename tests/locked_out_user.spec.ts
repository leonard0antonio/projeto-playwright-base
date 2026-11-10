import { test, expect } from "@playwright/test";

// O describe agrupa testes que têm o mesmo contexto
test.describe("Cenários de uso com locked_out_user", () => {

  // O beforeEach vai rodar esse trecho antes de CADA teste abaixo
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.saucedemo.com/");
    await page.locator('[data-test="username"]').fill("locked_out_user");
    await page.locator('[data-test="password"]').fill("secret_sauce");
    await page.locator('[data-test="login-button"]').click();

    // Garante que o login funcionou antes de seguir para os testes
    await expect(page.getByText("Products")).toBeVisible();
  });

  test('Deve impedir o login e exibir mensagem de usuário bloqueado', async ({ page }) => {
    
    // Asserção: Validar que a caixa de erro apareceu na tela
    const mensagemErro = page.locator('[data-test="error"]');
    await expect(mensagemErro).toBeVisible();

    // Asserção: Validar o texto exato do erro de bloqueio
    await expect(mensagemErro).toHaveText('Epic sadface: Sorry, this user has been locked out.');
  });

});

