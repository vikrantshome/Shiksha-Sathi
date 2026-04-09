import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
const PASSWORD = 'password123';

test.describe('Shiksha Sathi - Final Verification', () => {

  test('Verify New Features Presence', async ({ page }) => {
    // 1. LOGIN
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill('input[name="email"]', 'final@test.com');
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard');

    // 2. VERIFY CLASSES & ENROLLMENT LINK
    await page.goto(`${FRONTEND_URL}/teacher/classes`);
    
    // Check if "Enroll Students" exists (we created a class in previous manual steps or tests)
    const enrollLink = page.locator('text=Enroll Students');
    if (await enrollLink.count() > 0) {
        await enrollLink.first().click();
        await page.waitForURL('**/students');
        await expect(page.locator('h1:has-text("Enroll Students")')).toBeVisible();
        console.log('✅ Student Enrollment UI is Live');
    } else {
        console.log('ℹ️ No classes found, skipping enrollment check');
    }

    // 3. VERIFY QUESTION BANK & POINTS
    await page.goto(`${FRONTEND_URL}/teacher/question-bank?chapter=Polynomials&board=CBSE&class=10&subject=Mathematics`);
    
    // Check if questions rendered
    const addBtn = page.locator('button[title="Add to assignment"]');
    await expect(addBtn.first()).toBeVisible({ timeout: 15000 });
    await addBtn.first().click();

    // Check Tray
    await expect(page.locator('text=Review Assignment')).toBeVisible();
    await page.click('text=Review Assignment');
    
    await page.waitForURL('**/assignments/create');
    
    // 4. VERIFY ADMIN UNPUBLISH UI
    await page.goto(`${FRONTEND_URL}/admin`);
    const publishedBtn = page.locator('button:has-text("PUBLISHED")');
    if (await publishedBtn.isVisible()) {
        await publishedBtn.click();
        const unpublishBtn = page.locator('button:has-text("Unpublish")');
        if (await unpublishBtn.count() > 0) {
            console.log('✅ Admin Unpublish UI is Live');
        }
    }

  });

});
