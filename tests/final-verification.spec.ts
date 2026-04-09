import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
const UNIQUE_ID = Date.now();
const TEACHER_EMAIL = `teacher_${UNIQUE_ID}@test.com`;
const STUDENT_ROLL = `roll_${UNIQUE_ID}`;
const PASSWORD = 'password123';

test.describe('Shiksha Sathi - Final Verification Sweep', () => {

  test('Comprehensive Workflow: Teacher -> Class -> Student -> Assignment', async ({ page }) => {
    // 1. LOGIN TEACHER
    await page.goto(`${FRONTEND_URL}/login`);
    await page.fill('input[name="email"]', 'final@test.com');
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard', { timeout: 15000 });
    console.log('✅ Teacher Login Successful');

    // 2. CREATE CLASS
    await page.click('a:has-text("Manage Classes")');
    await page.waitForURL('**/teacher/classes');
    
    await page.fill('input[name="name"]', 'Verified Class 10');
    await page.selectOption('select[name="grade"]', '10');
    await page.fill('input[name="section"]', 'A');
    await page.click('button:has-text("Create Class")');
    
    // Wait for the class card to appear
    await expect(page.locator('text=Verified Class 10')).toBeVisible({ timeout: 10000 });
    console.log('✅ Class Creation Successful');

    // 3. ENROLL STUDENT (New Feature)
    await page.click('text=Enroll Students');
    await page.waitForURL('**/students');
    
    await page.fill('input[name="studentId"]', STUDENT_ROLL);
    await page.click('button:has-text("Add Student")');
    
    // Check list
    await expect(page.locator(`text=${STUDENT_ROLL}`)).toBeVisible({ timeout: 10000 });
    console.log('✅ Student Enrollment Verified');

    // 4. BROWSE BANK & ALLOCATE POINTS (New Feature)
    await page.goto(`${FRONTEND_URL}/teacher/question-bank?chapter=Polynomials&board=CBSE&class=10&subject=Mathematics`);
    
    // Click 'Add to assignment' on first question
    const addBtn = page.locator('button[title="Add to assignment"]').first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    // Navigate to Create Assignment
    await page.click('a:has-text("Review Assignment")');
    await page.waitForURL('**/assignments/create');

    // Verify Points Input
    const pointsInput = page.locator('input[type="number"]').first();
    await expect(pointsInput).toBeVisible();
    await pointsInput.fill('75');
    await pointsInput.blur();

    // Verify total marks update
    await expect(page.locator('text=75 Marks').first()).toBeVisible();
    console.log('✅ Question Point Allocation Verified');

    // 5. PUBLISH ASSIGNMENT
    await page.fill('input[name="title"]', 'Final Verified Assignment');
    // Select class from dropdown
    await page.selectOption('select[name="classId"]', { index: 1 });
    await page.click('button:has-text("Publish Assignment")');
    
    await page.waitForURL('**/teacher/dashboard', { timeout: 15000 });
    console.log('✅ Assignment Publication Successful');
  });

  test('System: Analytics Interception', async ({ page }) => {
    // Navigate to login
    await page.goto(`${FRONTEND_URL}/login`);

    const trackRequestPromise = page.waitForRequest(request => 
      request.url().includes('/analytics/track') && 
      request.method() === 'POST'
    );

    await page.fill('input[name="email"]', TEACHER_EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    const trackRequest = await trackRequestPromise;
    const payload = JSON.parse(trackRequest.postData() || '{}');
    expect(payload.eventName).toBe('teacher_logged_in');
    console.log('✅ Analytics Event Tracking Verified');
  });

});
