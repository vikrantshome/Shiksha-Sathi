# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify-all.spec.ts >> Shiksha Sathi - Unified Verification Suite >> 2. Teacher: Question Bank & Point Allocation
- Location: tests/verify-all.spec.ts:46:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[title="Add to assignment"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('button[title="Add to assignment"]').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "Shiksha Sathi" [ref=e6] [cursor=pointer]:
          - /url: /teacher/dashboard
        - generic [ref=e7]:
          - link "Assignment Builder" [ref=e8] [cursor=pointer]:
            - /url: /teacher/question-bank
          - generic [ref=e9]:
            - link "Create Assignment" [ref=e10] [cursor=pointer]:
              - /url: /teacher/assignments/create
              - img [ref=e11]
            - link [ref=e13] [cursor=pointer]:
              - /url: /teacher/profile
              - img [ref=e14]
    - generic [ref=e17]:
      - complementary [ref=e18]:
        - generic [ref=e19]:
          - paragraph [ref=e20]: Shiksha Sathi
          - paragraph [ref=e21]: Teacher Portal
        - navigation [ref=e22]:
          - link "Dashboard" [ref=e23] [cursor=pointer]:
            - /url: /teacher/dashboard
            - img [ref=e24]
            - text: Dashboard
          - link "My Classes" [ref=e29] [cursor=pointer]:
            - /url: /teacher/classes
            - img [ref=e30]
            - text: My Classes
          - link "Question Bank" [ref=e33] [cursor=pointer]:
            - /url: /teacher/question-bank
            - img [ref=e34]
            - text: Question Bank
        - generic [ref=e38]:
          - link "Create New Assignment" [ref=e39] [cursor=pointer]:
            - /url: /teacher/question-bank
          - button "Log out" [ref=e41] [cursor=pointer]:
            - img [ref=e42]
            - text: Log out
      - main [ref=e45]:
        - generic [ref=e47]:
          - generic [ref=e49]:
            - paragraph [ref=e50]: CBSE / Class 10
            - heading "Question Repository" [level=1] [ref=e51]
          - generic [ref=e53]:
            - generic [ref=e54]:
              - img
              - textbox "Search by topic, keyword or chapter..." [ref=e55]
            - generic [ref=e56]:
              - button "All Types" [ref=e57] [cursor=pointer]
              - button "MCQ" [ref=e58] [cursor=pointer]
              - button "True/False" [ref=e59] [cursor=pointer]
              - button "Fill Blanks" [ref=e60] [cursor=pointer]
          - generic [ref=e61]:
            - generic [ref=e65]:
              - generic [ref=e66]:
                - generic [ref=e67]:
                  - paragraph [ref=e68]: Filters
                  - paragraph [ref=e69]: Browse by syllabus scope
                - button "Reset" [ref=e70] [cursor=pointer]
              - generic [ref=e71]:
                - button "CBSE" [ref=e72] [cursor=pointer]:
                  - img [ref=e73]
                  - generic [ref=e78]: CBSE
                - combobox [ref=e80] [cursor=pointer]:
                  - option "Select Board" [selected]
                  - option "NCERT / CBSE"
              - generic [ref=e81]:
                - button "Class 10" [ref=e82] [cursor=pointer]:
                  - img [ref=e83]
                  - generic [ref=e86]: Class 10
                - generic [ref=e87]:
                  - button "6" [ref=e88] [cursor=pointer]
                  - button "7" [ref=e89] [cursor=pointer]
                  - button "8" [ref=e90] [cursor=pointer]
                  - button "9" [ref=e91] [cursor=pointer]
                  - button "10" [ref=e92] [cursor=pointer]
                  - button "11" [ref=e93] [cursor=pointer]
                  - button "12" [ref=e94] [cursor=pointer]
              - generic [ref=e95]:
                - button "Subject" [ref=e96] [cursor=pointer]:
                  - img [ref=e97]
                  - generic [ref=e99]: Subject
                - paragraph [ref=e101]: No subjects found
            - generic [ref=e103]:
              - img [ref=e105]
              - heading "Choose a Subject" [level=3] [ref=e107]
              - paragraph [ref=e108]: Select a subject to explore available chapters.
            - generic [ref=e110]:
              - heading "Assignment Basket" [level=2] [ref=e111]
              - generic [ref=e112]:
                - img [ref=e114]
                - paragraph [ref=e116]: No questions selected
                - paragraph [ref=e117]: Click + on questions to add them
  - button "Open Next.js Dev Tools" [ref=e123] [cursor=pointer]:
    - img [ref=e124]
  - alert [ref=e127]
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
> 54  |     await expect(addBtn).toBeVisible({ timeout: 15000 });
      |                          ^ Error: expect(locator).toBeVisible() failed
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
  81  |             await expect(unpublishBtn.first()).toBeVisible();
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