import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
const TEST_EMAIL = 'final@test.com'; // Use the stable test account we created
const TEST_PASS = 'password123';

test.describe('Shiksha Sathi - Unified Verification Suite', () => {

  async function login(page) {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard');
  }

  test('1. Teacher: Student Enrollment Flow', async ({ page }) => {
    await login(page);
    
    // Go to Classes
    await page.goto(`${FRONTEND_URL}/teacher/classes`);

    // Ensure at least one class exists
    const noClasses = await page.locator('text=No active classes yet').isVisible();
    if (noClasses) {
      await page.fill('input[name="name"]', 'Verification Class');
      await page.selectOption('select[name="grade"]', '10');
      await page.fill('input[name="section"]', 'A');
      await page.click('button:has-text("Create Class")');
      await expect(page.locator('text=Verification Class')).toBeVisible({ timeout: 10000 });
    }

    // Click Enroll Students
    await page.click('text=Enroll Students');
    await page.waitForURL('**/students');

    // Fill student ID
    const testRoll = `roll-${Math.floor(Math.random()*1000)}`;
    await page.fill('input[name="studentId"]', testRoll);
    await page.click('button:has-text("Add Student")');
    
    // Verify list updates
    await expect(page.locator(`text=${testRoll}`)).toBeVisible({ timeout: 10000 });
  });

  test('2. Teacher: Question Bank & Point Allocation', async ({ page }) => {
    await login(page);
    
    // Go to Question Bank
    await page.goto(`${FRONTEND_URL}/teacher/question-bank?chapter=Polynomials&board=CBSE&class=10&subject=Mathematics`);

    // Select a question
    const addBtn = page.locator('button[title="Add to assignment"]').first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    // Go to Review Assignment
    await page.click('a:has-text("Review Assignment")');
    await page.waitForURL('**/assignments/create');

    // Edit points
    const pointsInput = page.locator('input[type="number"]').first();
    await expect(pointsInput).toBeVisible();
    await pointsInput.fill('99');
    await pointsInput.blur();

    // Verify UI reflects 99 Marks
    await expect(page.locator('text=99 Marks').first()).toBeVisible();
  });

  test('3. Admin: Unpublish workflow presence', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin`);
    
    // Check if we are on admin page or redirected (if not admin)
    if (page.url().includes('/admin')) {
        const publishedTab = page.locator('button:has-text("PUBLISHED")');
        if (await publishedTab.isVisible()) {
            await publishedTab.click();
            const unpublishBtn = page.locator('button:has-text("Unpublish")');
            // We just check if it's there, no need to actually unpublish and break other tests
            await expect(unpublishBtn.first()).toBeVisible();
        }
    } else {
        test.skip(true, 'User is not an admin, skipping unpublish check');
    }
  });

  test('4. System: Analytics telemetry check', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);

    const trackRequestPromise = page.waitForRequest(request => 
      request.url().includes('/analytics/track') && 
      request.method() === 'POST'
    );

    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASS);
    await page.click('button[type="submit"]');

    const trackRequest = await trackRequestPromise;
    const payload = JSON.parse(trackRequest.postData() || '{}');
    expect(payload.eventName).toBe('teacher_logged_in');
  });

});
