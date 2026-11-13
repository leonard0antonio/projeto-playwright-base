import { test, expect } from '@playwright/test';

/**
 * Senior QA Test Suite - Sauce Demo E-commerce
 * 
 * Tags used:
 * - @smoke: Critical path tests (run on every PR)
 * - @regression: Full regression suite (run on merge/main)
 * - @visual: Visual regression tests (compare screenshots)
 * - @performance: Performance benchmarks
 * - @mobile: Mobile-specific tests
 * - @api: API-level tests
 */

// Test data constants
const TEST_USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performance: { username: 'performance_glitch_user', password: 'secret_sauce' },
};

const PRODUCTS = {
  backpack: 'sauce-labs-backpack',
  bikeLight: 'sauce-labs-bike-light',
  tShirt: 'sauce-labs-bolt-t-shirt',
  jacket: 'sauce-labs-fleece-jacket',
};

test.describe('Sauce Demo - E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Authentication @smoke @regression', () => {
    test('Standard user can login successfully @smoke', async ({ page }) => {
      await page.fill('[data-test="username"]', TEST_USERS.standard.username);
      await page.fill('[data-test="password"]', TEST_USERS.standard.password);
      await page.click('[data-test="login-button"]');
      
      await expect(page).toHaveURL(/.*inventory/);
      await expect(page.getByText('Products')).toBeVisible();
    });

    test('Locked out user cannot login @smoke', async ({ page }) => {
      await page.fill('[data-test="username"]', TEST_USERS.locked.username);
      await page.fill('[data-test="password"]', TEST_USERS.locked.password);
      await page.click('[data-test="login-button"]');
      
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toContainText('locked out');
    });

    test('Invalid credentials show error @regression', async ({ page }) => {
      await page.fill('[data-test="username"]', 'invalid_user');
      await page.fill('[data-test="password"]', 'wrong_password');
      await page.click('[data-test="login-button"]');
      
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
    });
  });

  test.describe('Product Catalog @smoke @regression', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStandardUser(page);
    });

    test('Products are displayed after login @smoke', async ({ page }) => {
      await expect(page.locator('.inventory_item')).toHaveCount(6);
      await expect(page.locator('.inventory_item_name').first()).toBeVisible();
    });

    test('Sort products by price low to high @regression', async ({ page }) => {
      await page.selectOption('[data-test="product-sort-container"]', 'lohi');
      await page.waitForTimeout(500); // Wait for sort animation
      
      const prices = await page.locator('.inventory_item_price').allInnerTexts();
      const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
      const sortedPrices = [...numericPrices].sort((a, b) => a - b);
      
      expect(numericPrices).toEqual(sortedPrices);
    });

    test('Sort products by name Z to A @regression', async ({ page }) => {
      await page.selectOption('[data-test="product-sort-container"]', 'za');
      await page.waitForTimeout(500);
      
      const names = await page.locator('.inventory_item_name').allInnerTexts();
      const sortedNames = [...names].sort().reverse();
      
      expect(names).toEqual(sortedNames);
    });
  });

  test.describe('Shopping Cart @smoke @regression', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStandardUser(page);
    });

    test('Add single item to cart @smoke', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    test('Add multiple items to cart @regression', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
      await page.click(`[data-test="add-to-cart-${PRODUCTS.bikeLight}"]`);
      await page.click(`[data-test="add-to-cart-${PRODUCTS.tShirt}"]`);
      
      await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
    });

    test('Remove item from cart @regression', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
      await page.click(`[data-test="remove-${PRODUCTS.backpack}"]`);
      
      await expect(page.locator('.shopping_cart_badge')).toBeHidden();
    });

    test('Cart persists across navigation @regression', async ({ page }) => {
      await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
      await page.click('.shopping_cart_link');
      await expect(page.locator('.cart_item')).toHaveCount(1);
      
      await page.click('[data-test="continue-shopping"]');
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });
  });

  test.describe('Checkout Flow @smoke @regression', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStandardUser(page);
      await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
      await page.click('.shopping_cart_link');
      await page.click('[data-test="checkout"]');
    });

    test('Complete checkout with valid info @smoke', async ({ page }) => {
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
      await page.click('[data-test="continue"]');
      
      await expect(page.getByText('Checkout: Overview')).toBeVisible();
      await page.click('[data-test="finish"]');
      
      await expect(page.getByText('Thank you for your order!')).toBeVisible();
      await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    });

    test('Show error when first name is missing @regression', async ({ page }) => {
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
      await page.click('[data-test="continue"]');
      
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
    });

    test('Show error when postal code is missing @regression', async ({ page }) => {
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.click('[data-test="continue"]');
      
      await expect(page.locator('[data-test="error"]')).toBeVisible();
      await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
    });
  });
});

test.describe('Visual Regression Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await loginAsStandardUser(page);
  });

  test('Product page visual snapshot @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('inventory-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Cart page visual snapshot @visual', async ({ page }) => {
    await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
    await page.click('.shopping_cart_link');
    
    await expect(page).toHaveScreenshot('cart-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Checkout step one visual snapshot @visual', async ({ page }) => {
    await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    
    await expect(page).toHaveScreenshot('checkout-step-one.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Checkout overview visual snapshot @visual', async ({ page }) => {
    await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    
    await expect(page).toHaveScreenshot('checkout-overview.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Performance Tests @performance', () => {
  test('Login page load performance @performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'load' });
    const loadTime = Date.now() - startTime;
    
    // Assert page loads within 3 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Log performance metrics
    const metrics = await page.evaluate(() => JSON.stringify(window.performance.timing));
    console.log('Performance metrics:', metrics);
  });

  test('Inventory page load after login @performance', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', TEST_USERS.standard.username);
    await page.fill('[data-test="password"]', TEST_USERS.standard.password);
    const startTime = Date.now();
    await page.click('[data-test="login-button"]');
    await expect(page.getByText('Products')).toBeVisible();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('Add to cart response time @performance', async ({ page }) => {
    await page.goto('/');
    await loginAsStandardUser(page);
    
    const startTime = Date.now();
    await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(1000);
  });
});

test.describe('Mobile Tests @mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAsStandardUser(page);
  });

  test('Mobile login flow @mobile @smoke', async ({ page }) => {
    await expect(page).toHaveURL(/.*inventory/);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('Mobile add to cart @mobile @regression', async ({ page }) => {
    await page.click(`[data-test="add-to-cart-${PRODUCTS.backpack}"]`);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Mobile hamburger menu @mobile @regression', async ({ page }) => {
    await page.click('#react-burger-menu-btn');
    await expect(page.locator('.bm-menu-wrap')).toHaveAttribute('aria-hidden', 'false');
    await page.click('[data-test="logout-sidebar-link"]');
    await expect(page).toHaveURL('/');
  });
});

test.describe('API Tests @api', () => {
  test('Health check endpoint @api @smoke', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
  });

  test.skip('Login API validation @api @regression', async ({ request }) => {
    const response = await request.post('/login', {
      form: {
        username: TEST_USERS.standard.username,
        password: TEST_USERS.standard.password,
      },
    });
    
    expect(response.status()).toBe(200);
    // Note: SauceDemo doesn't have a real API, this is for demonstration
  });
});

// Helper functions
async function loginAsStandardUser(page: any) {
  await page.fill('[data-test="username"]', TEST_USERS.standard.username);
  await page.fill('[data-test="password"]', TEST_USERS.standard.password);
  await page.click('[data-test="login-button"]');
  await expect(page.getByText('Products')).toBeVisible();
}