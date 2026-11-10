import { test, expect } from "@playwright/test";

// O describe agrupa testes que têm o mesmo contexto
test.describe("Cenários de uso com visual_user", () => {

  // O beforeEach vai rodar esse trecho antes de CADA teste abaixo
  test.beforeEach(async ({ page }) => {
    await page.goto("https://www.saucedemo.com/");
    await page.locator('[data-test="username"]').fill("visual_user");
    await page.locator('[data-test="password"]').fill("secret_sauce");
    await page.locator('[data-test="login-button"]').click();

    // Garante que o login funcionou antes de seguir para os testes
    await expect(page.getByText("Products")).toBeVisible();
  });

  test('Deve capturar a troca indevida da imagem da mochila', async ({ page }) => {
    // O visual_user também sofre do bug onde a imagem correta é trocada pelo mascote
    const imagemMochila = page.locator('#item_4_img_link img');
    const src = await imagemMochila.getAttribute('src');
    
    expect(src).toContain('sl-404');
  });

  test('Deve validar o layout da página usando Screenshot (Regressão Visual)', async ({ page }) => {
    // Foca apenas na área dos produtos para não pegar variações do navegador inteiro
    const listaProdutos = page.locator('.inventory_list');
    
    // IMPORTANTE: Na PRIMEIRA vez que você rodar este teste, ele vai FALHAR. 
    // O Playwright dirá: "A snapshot doesn't exist... writing actual".
    // Ele criará uma pasta no seu projeto com a imagem base.
    // Nas próximas execuções, ele comparará a tela real com essa imagem salva, 
    // capturando qualquer botão torto ou CSS quebrado que o visual_user causa!
      await expect(listaProdutos).toHaveScreenshot('layout-produtos.png', { maxDiffPixels: 2000 });
  });

  test('Deve capturar erro de alinhamento no botão de adicionar ao carrinho', async ({ page }) => {
    // O visual_user bagunça o CSS de vários botões. Vamos focar apenas no botão da mochila.
    const botaoAdicionar = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Tiramos um snapshot apenas do botão. Se a cor, tamanho ou alinhamento mudar, o teste falha.
    await expect(botaoAdicionar).toHaveScreenshot('botao-mochila-layout.png');
  });

  test('Deve capturar o layout quebrado na página do carrinho', async ({ page }) => {
    // Adiciona o item e navega para o carrinho
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();

    // Seleciona a área principal que contém a lista de itens no carrinho
    const areaCarrinho = page.locator('.cart_contents_container');
    
    // O visual_user também quebra o layout da tela do carrinho (elementos sobrepostos)
    await expect(areaCarrinho).toHaveScreenshot('layout-tela-carrinho.png');
  });

});

