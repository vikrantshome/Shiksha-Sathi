import { test, expect } from '@playwright/test';

test('create custom question flow', async ({ page }) => {
  await page.goto('http://localhost:4000');
  await page.waitForLoadState('networkidle');
  
  const emailInput = page.locator('input[type="email"], input[name="email"], input[type="text"]').first();
  const passwordInput = page.locator('input[type="password"]');
  const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in")');
  
  if (await emailInput.isVisible()) {
    await emailInput.fill('teacher@test.com');
    await passwordInput.fill('password123');
    await loginButton.click();
    await page.waitForLoadState('networkidle');
  }
  
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());
  
  await page.screenshot({ path: '/tmp/custom-question-test.png', fullPage: true });
  console.log('Screenshot saved to /tmp/custom-question-test.png');
});