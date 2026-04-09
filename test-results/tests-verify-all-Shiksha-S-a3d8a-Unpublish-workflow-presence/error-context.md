# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify-all.spec.ts >> Shiksha Sathi - Unified Verification Suite >> 3. Admin: Unpublish workflow presence
- Location: tests/verify-all.spec.ts:71:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Unpublish")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Unpublish")').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - 'heading "Admin Dashboard: Derived Content" [level=1] [ref=e5]'
      - paragraph [ref=e6]: Review, and publish derived practice questions.
    - generic [ref=e7]:
      - generic [ref=e9]:
        - heading "Taxonomy" [level=3] [ref=e10]
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: Board
            - combobox [ref=e14]:
              - option "Select Board..." [selected]
          - generic [ref=e15]:
            - generic [ref=e16]: Class
            - combobox [disabled] [ref=e17]:
              - option "Select Class..." [selected]
          - generic [ref=e18]:
            - generic [ref=e19]: Subject
            - combobox [disabled] [ref=e20]:
              - option "Select Subject..." [selected]
          - generic [ref=e21]:
            - generic [ref=e22]: Book
            - combobox [disabled] [ref=e23]:
              - option "Select Book..." [selected]
          - generic [ref=e24]:
            - generic [ref=e25]: Chapter
            - combobox [disabled] [ref=e26]:
              - option "Select Chapter..." [selected]
              - option "Control and Coordination"
              - option "Grammar"
              - option "Life Processes"
              - option "Nationalism in India"
              - option "Polynomials"
              - option "Quadratic Equations"
      - generic [ref=e27]:
        - generic [ref=e28]:
          - button "DRAFT" [ref=e29]
          - button "APPROVED" [ref=e30]
          - button "REJECTED" [ref=e31]
          - button "PUBLISHED" [active] [ref=e32]
        - generic [ref=e33]: "No derived questions found for status: PUBLISHED. Select a chapter or try a different status."
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e43]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
  4   | const TEST_EMAIL = 'final@test.com'; // Use the stable test account we created
  5   | const TEST_PASS = 'password123';
  6   | 
  7   | test.describe('Shiksha Sathi - Unified Verification Suite', () => {
  8   | 
  9   |   async function login(page) {
  10  |     await page.goto(`${FRONTEND_URL}/login`);
  11  |     await page.fill('input[name="email"]', TEST_EMAIL);
  12  |     await page.fill('input[name="password"]', TEST_PASS);
  13  |     await page.click('button[type="submit"]');
  14  |     await page.waitForURL('**/teacher/dashboard');
  15  |   }
  16  | 
  17  |   test('1. Teacher: Student Enrollment Flow', async ({ page }) => {
  18  |     await login(page);
  19  |     
  20  |     // Go to Classes
  21  |     await page.goto(`${FRONTEND_URL}/teacher/classes`);
  22  | 
  23  |     // Ensure at least one class exists
  24  |     const noClasses = await page.locator('text=No active classes yet').isVisible();
  25  |     if (noClasses) {
  26  |       await page.fill('input[name="name"]', 'Verification Class');
  27  |       await page.selectOption('select[name="grade"]', '10');
  28  |       await page.fill('input[name="section"]', 'A');
  29  |       await page.click('button:has-text("Create Class")');
  30  |       await expect(page.locator('text=Verification Class')).toBeVisible({ timeout: 10000 });
  31  |     }
  32  | 
  33  |     // Click Enroll Students
  34  |     await page.click('text=Enroll Students');
  35  |     await page.waitForURL('**/students');
  36  | 
  37  |     // Fill student ID
  38  |     const testRoll = `roll-${Math.floor(Math.random()*1000)}`;
  39  |     await page.fill('input[name="studentId"]', testRoll);
  40  |     await page.click('button:has-text("Add Student")');
  41  |     
  42  |     // Verify list updates
  43  |     await expect(page.locator(`text=${testRoll}`)).toBeVisible({ timeout: 10000 });
  44  |   });
  45  | 
  46  |   test('2. Teacher: Question Bank & Point Allocation', async ({ page }) => {
  47  |     await login(page);
  48  |     
  49  |     // Go to Question Bank
  50  |     await page.goto(`${FRONTEND_URL}/teacher/question-bank?chapter=Polynomials&board=CBSE&class=10&subject=Mathematics`);
  51  | 
  52  |     // Select a question
  53  |     const addBtn = page.locator('button[title="Add to assignment"]').first();
  54  |     await expect(addBtn).toBeVisible({ timeout: 15000 });
  55  |     await addBtn.click();
  56  | 
  57  |     // Go to Review Assignment
  58  |     await page.click('a:has-text("Review Assignment")');
  59  |     await page.waitForURL('**/assignments/create');
  60  | 
  61  |     // Edit points
  62  |     const pointsInput = page.locator('input[type="number"]').first();
  63  |     await expect(pointsInput).toBeVisible();
  64  |     await pointsInput.fill('99');
  65  |     await pointsInput.blur();
  66  | 
  67  |     // Verify UI reflects 99 Marks
  68  |     await expect(page.locator('text=99 Marks').first()).toBeVisible();
  69  |   });
  70  | 
  71  |   test('3. Admin: Unpublish workflow presence', async ({ page }) => {
  72  |     await page.goto(`${FRONTEND_URL}/admin`);
  73  |     
  74  |     // Check if we are on admin page or redirected (if not admin)
  75  |     if (page.url().includes('/admin')) {
  76  |         const publishedTab = page.locator('button:has-text("PUBLISHED")');
  77  |         if (await publishedTab.isVisible()) {
  78  |             await publishedTab.click();
  79  |             const unpublishBtn = page.locator('button:has-text("Unpublish")');
  80  |             // We just check if it's there, no need to actually unpublish and break other tests
> 81  |             await expect(unpublishBtn.first()).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
  82  |         }
  83  |     } else {
  84  |         test.skip(true, 'User is not an admin, skipping unpublish check');
  85  |     }
  86  |   });
  87  | 
  88  |   test('4. System: Analytics telemetry check', async ({ page }) => {
  89  |     await page.goto(`${FRONTEND_URL}/login`);
  90  | 
  91  |     const trackRequestPromise = page.waitForRequest(request => 
  92  |       request.url().includes('/analytics/track') && 
  93  |       request.method() === 'POST'
  94  |     );
  95  | 
  96  |     await page.fill('input[name="email"]', TEST_EMAIL);
  97  |     await page.fill('input[name="password"]', TEST_PASS);
  98  |     await page.click('button[type="submit"]');
  99  | 
  100 |     const trackRequest = await trackRequestPromise;
  101 |     const payload = JSON.parse(trackRequest.postData() || '{}');
  102 |     expect(payload.eventName).toBe('teacher_logged_in');
  103 |   });
  104 | 
  105 | });
  106 | 
```