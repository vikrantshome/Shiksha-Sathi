import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
const TEST_EMAIL = 'final@test.com';
const TEST_PASS = 'password123';

test.describe('Global Loaders Regression Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Mock analytics track endpoint
    await page.route('**/api/v1/analytics/track', async route => {
      await route.fulfill({ json: { success: true } });
    });
  });

  async function login(page: Page) {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard');
  }

  test('1. Verify Loader in Question Bank Filtering', async ({ page }) => {
    await login(page);
    
    await page.goto(`${FRONTEND_URL}/teacher/question-bank`);
    
    // Select a board to trigger taxonomy reload
    await page.click('button:has-text("CBSE")');
    
    // Check for loader appearance
    const loader = page.locator('svg.animate-spin');
    // We expect the loader to appear (even if briefly)
    await expect(loader.first()).toBeVisible();
    
    // Wait for loader to disappear and content to load
    await expect(loader.first()).toBeHidden({ timeout: 15000 });
  });

  test('2. Verify Loader in School Search', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/signup`);
    
    const schoolInput = page.locator('input[placeholder*="e.g. Delhi Public"]');
    await schoolInput.fill('Delhi');
    
    // Check for "Searching..." loader in dropdown
    const loader = page.locator('svg.animate-spin');
    await expect(loader.first()).toBeVisible();
    
    // Wait for results
    await expect(loader.first()).toBeHidden({ timeout: 15000 });
  });

  test('3. Verify Button Loader in Login', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Intercept login to slow it down and see the loader
    await page.route('**/api/v1/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({ json: { token: 'mock-token', role: 'TEACHER' } });
    });

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Check for spinner inside the button
    const buttonLoader = page.locator('button[type="submit"] svg.animate-spin');
    await expect(buttonLoader).toBeVisible();
    
    // Should eventually redirect
    await page.waitForURL('**/teacher/dashboard');
  });

  test('4. Verify Page Loader (loading.tsx)', async ({ page }) => {
    await login(page);
    
    // Slow down the classes fetch to trigger loading.tsx
    await page.route('**/api/v1/classes/me', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({ json: [] });
    });

    await page.click('a:has-text("Manage Classes")');
    
    // Next.js loading.tsx usually renders immediately on navigation
    const pageLoader = page.locator('svg.animate-spin');
    await expect(pageLoader).toBeVisible();
    
    // Wait for the actual page content
    await page.waitForURL('**/teacher/classes');
    await expect(pageLoader).toBeHidden();
  });

});
