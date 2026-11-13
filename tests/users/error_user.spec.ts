import { test, expect } from "@playwright/test";

// O describe agrupa testes que têm o mesmo contexto
test.describe("Cenários de uso com error_user", () => {

  // O beforeEach vai rodar esse trecho antes de CADA teste abaixo
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="username"]').fill("error_user");
    await page.locator('[data-test="password"]').fill("secret_sauce");
    await page.locator('[data-test="login-button"]').click();

    // Garante que o login funcionou antes de seguir para os testes
    await expect(page.getByText("Products")).toBeVisible();
  });

  test('Deve capturar falha silenciosa ao tentar ordenar os produtos', async ({ page }) => {
    // Tenta ordenar de Z a A
    await page.locator('[data-test="product-sort-container"]').selectOption('za');
    
    const nomePrimeiroProduto = await page.locator('.inventory_item_name').first().innerText();
    
    // Asserção: O sistema ignora o comando e mantém a ordem padrão (A-Z), mantendo a mochila em primeiro
    expect(nomePrimeiroProduto).toBe('Sauce Labs Backpack');
  });

  test('Deve capturar erro ao tentar remover produto da tela inicial', async ({ page }) => {
    // Adiciona a mochila ao carrinho
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Tenta clicar no botão "Remove" que apareceu
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    
    // Asserção: O clique falha silenciosamente e o carrinho continua com 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Deve capturar o bloqueio de digitação no campo de Sobrenome (Checkout)', async ({ page }) => {
    // Vai direto para o checkout
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Preenche o primeiro nome
    await page.locator('[data-test="firstName"]').fill('Marcos');
    
    // Tenta preencher o sobrenome
    const campoSobrenome = page.locator('[data-test="lastName"]');
    await campoSobrenome.fill('Oliveira');

    // Asserção: O campo recusa a entrada de dados devido a um erro programado na página
    await expect(campoSobrenome).toHaveValue('');
  });

});

