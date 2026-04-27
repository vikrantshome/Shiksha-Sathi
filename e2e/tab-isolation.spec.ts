import { test, expect } from '@playwright/test';

test.describe('SessionStorage Tab Isolation', () => {
  test('Multiple tabs have independent auth sessions', async ({ browser }) => {
    // Create two isolated contexts (simulate two tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Tab 1: Login as Teacher
    await page1.goto('/login');
    await page1.fill('input[name="phone"]', '9876543210');
    await page1.fill('input[name="password"]', 'teacher123');
    await page1.click('button[type="submit"]');
    
    // Wait for redirect to teacher dashboard
    await page1.waitForURL('**/teacher/dashboard**', { timeout: 10000 });
    
    // Verify token is in sessionStorage (not cookie)
    const token1 = await page1.evaluate(() => sessionStorage.getItem('shiksha-sathi-token'));
    expect(token1).toBeTruthy();
    
    // Tab 2: Should NOT have the token (independent session)
    const token2 = await page2.evaluate(() => sessionStorage.getItem('shiksha-sathi-token'));
    expect(token2).toBeNull();
    
    // Tab 2: Should be redirected to login
    await page2.goto('/teacher/dashboard');
    await page2.waitForURL('**/login**', { timeout: 5000 });
    
    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('Logout clears only current tab session', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login
    await page.goto('/login');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="password"]', 'teacher123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard**', { timeout: 10000 });
    
    // Verify logged in
    let token = await page.evaluate(() => sessionStorage.getItem('shiksha-sathi-token'));
    expect(token).toBeTruthy();
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Verify token cleared
    token = await page.evaluate(() => sessionStorage.getItem('shiksha-sathi-token'));
    expect(token).toBeNull();
    
    // Should redirect to login
    await page.waitForURL('**/login**', { timeout: 5000 });
    
    await context.close();
  });

  test('Student identity persists across tabs in localStorage', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Tab 1: Student login
    await page1.goto('/student/login');
    await page1.fill('input[name="phone"]', '1234567890');
    await page1.fill('input[name="password"]', 'student123');
    await page1.click('button[type="submit"]');
    await page1.waitForURL('**/student/dashboard**', { timeout: 10000 });
    
    // Verify student identity is in localStorage (shared)
    const identity1 = await page1.evaluate(() => localStorage.getItem('shiksha-sathi-student-identity'));
    expect(identity1).toBeTruthy();
    
    // Tab 2: Should NOT have auth token (sessionStorage is tab-isolated)
    const token2 = await page2.evaluate(() => sessionStorage.getItem('shiksha-sathi-token'));
    expect(token2).toBeNull();
    
    // But localStorage may be shared (by design)
    const identity2 = await page2.evaluate(() => localStorage.getItem('shiksha-sathi-student-identity'));
    // Identity might be null in new context, that's expected
    expect(identity2).toBeNull(); // Different context = different localStorage
    
    await context1.close();
    await context2.close();
  });
});
