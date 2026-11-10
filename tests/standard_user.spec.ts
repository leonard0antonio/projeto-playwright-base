import { test, expect } from '@playwright/test';

// O describe agrupa testes que têm o mesmo contexto
test.describe('Cenários de uso com standard_user', () => {

  // O beforeEach vai rodar esse trecho antes de CADA teste abaixo
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    
    // Garante que o login funcionou antes de seguir para os testes
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('Deve ordenar os produtos do menor para o maior preço', async ({ page }) => {
    // Interagir com um elemento do tipo "Select" (Dropdown)
    // O valor 'lohi' significa "Low to High"
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    // Pegamos o texto do preço do primeiro produto exibido
    const precoPrimeiroProduto = await page.locator('.inventory_item_price').first().innerText();
    
    // Validamos se o primeiro produto agora é o mais barato ($7.99)
    expect(precoPrimeiroProduto).toBe('$7.99');
  });

  test('Deve adicionar e remover um item do carrinho', async ({ page }) => {
    // Clicar para adicionar a mochila
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Validar que o carrinho tem 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Na própria página, o botão muda para "Remove". Vamos clicar nele.
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // A badge vermelha com o número deve desaparecer da tela (toBeHidden)
    await expect(page.locator('.shopping_cart_badge')).toBeHidden();
  });

  test('Deve acessar os detalhes de um produto específico', async ({ page }) => {
    // Clicar no título do produto "Sauce Labs Fleece Jacket"
    await page.locator('.inventory_item_name').filter({ hasText: 'Sauce Labs Fleece Jacket' }).click();

    // Validar se estamos na página de detalhes correta verificando o título grande
    await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Fleece Jacket');
    
    // Validar se o preço exibido na página de detalhes está correto
    await expect(page.locator('.inventory_details_price')).toHaveText('$49.99');
  });

  test('Deve exibir erro ao tentar fazer checkout com campos vazios', async ({ page }) => {
    // Ir direto para o carrinho e depois para o checkout
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Clicar em continuar sem preencher Nome, Sobrenome e CEP
    await page.locator('[data-test="continue"]').click();

    // Asserção: Um elemento de erro deve aparecer
    const mensagemErro = page.locator('[data-test="error"]');
    await expect(mensagemErro).toBeVisible();
    
    // Asserção: O texto do erro deve avisar que o Primeiro Nome é obrigatório
    await expect(mensagemErro).toContainText('Error: First Name is required');
  });

  test('Deve realizar o logout com sucesso', async ({ page }) => {
    // Abrir o menu lateral esquerdo (hamburguer)
    await page.getByRole('button', { name: 'Open Menu' }).click();

    // Clicar no botão de logout
    await page.locator('[data-test="logout-sidebar-link"]').click();

    // Asserção: Garantir que voltamos para a tela inicial verificando o botão de login
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('Deve cancelar o checkout e retornar ao carrinho', async ({ page }) => {
    // Adicionar um produto e ir para o carrinho
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    
    // Iniciar o checkout
    await page.locator('[data-test="checkout"]').click();

    // Desistir e clicar no botão de cancelar na tela de informações
    await page.locator('[data-test="cancel"]').click();

    // Validar que retornamos para a tela do carrinho verificando o título da página
    await expect(page.locator('.title')).toHaveText('Your Cart');
  });

  test('Deve manter o item no carrinho após recarregar a página', async ({ page }) => {
    // Adicionar um item ao carrinho
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    
    // Validar que o carrinho tem 1 item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Recarregar a página simulando um F5 do usuário
    await page.reload();

    // Asserção: O carrinho deve continuar mostrando 1 item após a atualização da tela
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });
  
});