import { test, expect } from "@playwright/test";

// O describe agrupa testes que têm o mesmo contexto
test.describe("Cenários de uso com performance_glitch_user", () => {

  // O beforeEach vai rodar esse trecho antes de CADA teste abaixo
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="username"]').fill("performance_glitch_user");
    await page.locator('[data-test="password"]').fill("secret_sauce");
    await page.locator('[data-test="login-button"]').click();

    // Garante que o login funcionou antes de seguir para os testes
    await expect(page.getByText("Products")).toBeVisible();
  });

 test('Deve conseguir finalizar uma compra normalmente após a lentidão do login', async ({ page }) => {
    
    // Fluxo normal de compra
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    
    await page.locator('[data-test="firstName"]').fill('Ana');
    await page.locator('[data-test="lastName"]').fill('Costa');
    await page.locator('[data-test="postalCode"]').fill('87654321');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    
    // Asserção: Validar sucesso
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  });

  test('Deve garantir que todos os 6 produtos carregam mesmo com atraso na resposta', async ({ page }) => {
    
    // Asserção: O Auto-wait do Playwright aguarda o carregamento da lista
    // toHaveCount é excelente para validar se a API/banco retornou todos os itens esperados
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('Deve abrir e fechar o menu lateral sem falhas de sincronia', async ({ page }) => {
    
    await expect(page.getByText('Products')).toBeVisible();

    // Abrir o menu
    await page.getByRole('button', { name: 'Open Menu' }).click();
    
    // Asserção: Validar se o menu expandiu corretamente checando o atributo aria-hidden
    const menuLateral = page.locator('.bm-menu-wrap');
    await expect(menuLateral).toHaveAttribute('aria-hidden', 'false');

    // Fechar o menu
    await page.getByRole('button', { name: 'Close Menu' }).click();
    
    // Asserção: O Playwright aguarda a animação terminar para validar o fechamento
    await expect(menuLateral).toHaveAttribute('aria-hidden', 'true');
  });

});