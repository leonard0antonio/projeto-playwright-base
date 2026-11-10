import { FullConfig } from '@playwright/test';

/**
 * Global Setup - Runs once before all tests
 * Use for: authentication, test data seeding, environment validation
 */
export default async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Global Setup...');
  
  // Validate environment
  const baseURL = process.env.BASE_URL || 'https://www.saucedemo.com';
  console.log(`📍 Base URL: ${baseURL}`);
  
  // Verify application is accessible
  try {
    const response = await fetch(baseURL);
    if (!response.ok) {
      throw new Error(`Application not accessible: ${response.status}`);
    }
    console.log('✅ Application is accessible');
  } catch (error) {
    console.error('❌ Application health check failed:', error);
    throw error;
  }
  
  // Setup test data if needed
  // await seedTestData();
  
  // Authenticate and save storage state for reuse
  // const { chromium } = require('@playwright/test');
  // const browser = await chromium.launch();
  // const context = await browser.newContext();
  // const page = await context.newPage();
  // await page.goto(`${baseURL}/login`);
  // await page.fill('[data-test="username"]', 'standard_user');
  // await page.fill('[data-test="password"]', 'secret_sauce');
  // await page.click('[data-test="login-button"]');
  // await context.storageState({ path: 'tests/auth/storageState.json' });
  // await browser.close();
  
  console.log('✅ Global Setup completed');
}