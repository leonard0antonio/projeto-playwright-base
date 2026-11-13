import { test, expect } from "@playwright/test";

// O describe agrupa testes que têm o mesmo contexto
test.describe("Cenários de uso com problem_user", () => {

  // O beforeEach vai rodar esse trecho antes de CADA teste abaixo
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="username"]').fill("problem_user");
    await page.locator('[data-test="password"]').fill("secret_sauce");
    await page.locator('[data-test="login-button"]').click();

    // Garante que o login funcionou antes de seguir para os testes
    await expect(page.getByText("Products")).toBeVisible();
  });

  test('Deve capturar o bug das imagens quebradas', async ({ page }) => {
    // Pegar a imagem do primeiro produto (a mochila)
    const imagemMochila = page.locator('#item_4_img_link img');
    
    // Pegar o atributo "src" (caminho da imagem)
    const src = await imagemMochila.getAttribute('src');
    
    // Asserção: Para esse usuário, a imagem original é substituída por uma imagem de erro com "sl-404" no nome
    expect(src).toContain('sl-404');
  });

  test('Deve capturar o bug do campo de sobrenome travado no checkout', async ({ page }) => {
    // Adicionar um item e navegar até o formulário de checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Tentar preencher o formulário
    await page.locator('[data-test="firstName"]').fill('João');
    
    // O problem_user tem um bug no código da página que apaga ou impede a digitação no Last Name
    const campoSobrenome = page.locator('[data-test="lastName"]');
    await campoSobrenome.fill('Silva');

    // Asserção: Mesmo após o comando "fill", o campo continuará vazio ('') devido ao bug do site
    await expect(campoSobrenome).toHaveValue('');
  });

  test('Deve capturar o bug do botão de remover do carrinho que não funciona', async ({ page }) => {
    // Adiciona a mochila ao carrinho
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Tenta clicar no botão que agora mudou para "Remove"
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    
    // Asserção: O Playwright captura o bug provando que o carrinho continua com 1 item 
    // e o botão não voltou ao estado de "Add to cart"
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('Deve capturar o bug da ordenação de produtos que não surte efeito', async ({ page }) => {
    // Tenta ordenar do maior para o menor preço (hilo = high to low)
    await page.locator('[data-test="product-sort-container"]').selectOption('hilo');
    
    // Pega o nome do primeiro produto exibido na tela após tentar ordenar
    const nomePrimeiroProduto = await page.locator('.inventory_item_name').first().innerText();
    
    // Asserção: O primeiro item deveria ser a jaqueta (mais cara), mas continua sendo a mochila (bug)
    expect(nomePrimeiroProduto).toBe('Sauce Labs Backpack');
  });

});


