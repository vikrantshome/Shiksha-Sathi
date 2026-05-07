import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
const TEST_EMAIL = 'test_unique@test.com';
const TEST_PASS = 'password123';

test.describe('Shiksha Sathi E2E WBS - Admin & Points', () => {

  async function realLogin(page: Page) {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard');
  }

  test('Teacher: Question Point Allocation (Direct Link)', async ({ page }) => {
    // We navigate to question bank, select, and go to create
    await realLogin(page);
    await page.goto(`${FRONTEND_URL}/teacher/question-bank?chapter=Polynomials&board=CBSE&class=10&subject=Mathematics`);
    
    const selectBtn = page.locator('button[title="Add to assignment"]').first();
    await expect(selectBtn).toBeVisible({ timeout: 15000 });
    await selectBtn.click();

    // Navigate to create page via link to preserve context
    await page.click('a:has-text("Review Assignment")');
    await page.waitForURL('**/assignments/create');

    const pointsInput = page.locator('input[type="number"]').first();
    await expect(pointsInput).toBeVisible();
    await pointsInput.fill('10');
    await pointsInput.blur();

    await expect(page.locator('text=10 Marks').first()).toBeVisible();
  });

});
