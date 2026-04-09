# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/verify-all.spec.ts >> Shiksha Sathi - Unified Verification Suite >> 4. System: Analytics telemetry check
- Location: tests/verify-all.spec.ts:88:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForRequest: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - navigation [ref=e13]:
      - generic [ref=e14]:
        - link "Shiksha Sathi" [ref=e16] [cursor=pointer]:
          - /url: /teacher/dashboard
        - generic [ref=e17]:
          - link "Assignment Builder" [ref=e18] [cursor=pointer]:
            - /url: /teacher/question-bank
          - generic [ref=e19]:
            - link "Create Assignment" [ref=e20] [cursor=pointer]:
              - /url: /teacher/assignments/create
              - img [ref=e21]
            - link [ref=e23] [cursor=pointer]:
              - /url: /teacher/profile
              - img [ref=e24]
    - generic [ref=e27]:
      - complementary [ref=e28]:
        - generic [ref=e29]:
          - paragraph [ref=e30]: Shiksha Sathi
          - paragraph [ref=e31]: Teacher Portal
        - navigation [ref=e32]:
          - link "Dashboard" [ref=e33] [cursor=pointer]:
            - /url: /teacher/dashboard
            - img [ref=e34]
            - text: Dashboard
          - link "My Classes" [ref=e39] [cursor=pointer]:
            - /url: /teacher/classes
            - img [ref=e40]
            - text: My Classes
          - link "Question Bank" [ref=e43] [cursor=pointer]:
            - /url: /teacher/question-bank
            - img [ref=e44]
            - text: Question Bank
        - generic [ref=e48]:
          - link "Create New Assignment" [ref=e49] [cursor=pointer]:
            - /url: /teacher/question-bank
          - button "Log out" [ref=e51] [cursor=pointer]:
            - img [ref=e52]
            - text: Log out
      - main [ref=e55]:
        - generic [ref=e57]:
          - generic [ref=e60]:
            - generic [ref=e61]: Teacher Dashboard
            - heading "Good morning, Final." [level=1] [ref=e62]
            - paragraph [ref=e63]: Your teaching studio is aligned for the day. You have 0 active assignments ready for review or follow-up.
          - generic [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66]:
                - img [ref=e68]
                - generic [ref=e71]: +0 this week
              - heading "0" [level=3] [ref=e72]
              - paragraph [ref=e73]: Total Assignments
            - generic [ref=e74]:
              - generic [ref=e75]:
                - img [ref=e77]
                - generic [ref=e82]: 0% completion
              - heading "0" [level=3] [ref=e83]
              - paragraph [ref=e84]: Total Submissions
            - generic [ref=e85]:
              - generic [ref=e86]:
                - img [ref=e88]
                - generic [ref=e91]: +4.2% trend
              - heading "—" [level=3] [ref=e92]
              - paragraph [ref=e93]: Average Score
            - generic [ref=e94]:
              - generic [ref=e95]:
                - img [ref=e97]
                - generic [ref=e100]: All Grades
              - heading "0" [level=3] [ref=e101]
              - paragraph [ref=e102]: Active Classes
          - generic [ref=e103]:
            - generic [ref=e104]:
              - heading "Recent Assignments" [level=2] [ref=e106]
              - generic [ref=e107]:
                - img [ref=e109]
                - heading "No Assignments Yet" [level=4] [ref=e111]
                - paragraph [ref=e112]: Browse the Question Bank to build your first assignment and start your classroom workflow.
                - link "Create New Assignment" [ref=e113] [cursor=pointer]:
                  - /url: /teacher/question-bank
                  - text: Create New Assignment
                  - img [ref=e114]
            - generic [ref=e116]:
              - generic [ref=e117]:
                - heading "Teaching Focus" [level=2] [ref=e118]
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - paragraph [ref=e121]: Review Queue
                    - paragraph [ref=e122]: "0"
                    - paragraph [ref=e123]: Assignments currently collecting or awaiting submissions.
                  - generic [ref=e124]:
                    - link "Create Assignment" [ref=e125] [cursor=pointer]:
                      - /url: /teacher/question-bank
                      - img [ref=e126]
                      - text: Create Assignment
                    - link "Manage Classes" [ref=e128] [cursor=pointer]:
                      - /url: /teacher/classes
                      - img [ref=e129]
                      - text: Manage Classes
              - generic [ref=e131]:
                - heading "Recent Activity" [level=2] [ref=e132]
                - generic [ref=e133]:
                  - generic [ref=e134]:
                    - paragraph [ref=e136]: New submission in Class 9A
                    - paragraph [ref=e137]: 12 minutes ago
                  - generic [ref=e138]:
                    - paragraph [ref=e140]: Assignment 'Periodic Table' scheduled
                    - paragraph [ref=e141]: 2 hours ago
                  - generic [ref=e142]:
                    - paragraph [ref=e144]: "Question Bank updated: Biology"
                    - paragraph [ref=e145]: Yesterday
          - generic [ref=e146]:
            - heading "Curriculum Explorer" [level=2] [ref=e147]
            - generic [ref=e148]:
              - generic [ref=e152] [cursor=pointer]:
                - generic [ref=e153]:
                  - generic [ref=e154]: Grade 9
                  - generic [ref=e155]: NCERT
                - generic [ref=e156]: Mathematics
                - generic [ref=e157]:
                  - text: Explore
                  - img [ref=e158]
              - generic [ref=e163] [cursor=pointer]:
                - generic [ref=e164]:
                  - generic [ref=e165]: Grade 9
                  - generic [ref=e166]: NCERT
                - generic [ref=e167]: ICT
                - generic [ref=e168]:
                  - text: Explore
                  - img [ref=e169]
              - generic [ref=e174] [cursor=pointer]:
                - generic [ref=e175]:
                  - generic [ref=e176]: Grade 11
                  - generic [ref=e177]: NCERT
                - generic [ref=e178]: Biology
                - generic [ref=e179]:
                  - text: Explore
                  - img [ref=e180]
              - generic [ref=e185] [cursor=pointer]:
                - generic [ref=e186]:
                  - generic [ref=e187]: Grade 7
                  - generic [ref=e188]: NCERT
                - generic [ref=e189]: Social Science
                - generic [ref=e190]:
                  - text: Explore
                  - img [ref=e191]
              - generic [ref=e196] [cursor=pointer]:
                - generic [ref=e197]:
                  - generic [ref=e198]: Grade 11
                  - generic [ref=e199]: NCERT
                - generic [ref=e200]: Chemistry
                - generic [ref=e201]:
                  - text: Explore
                  - img [ref=e202]
              - generic [ref=e207] [cursor=pointer]:
                - generic [ref=e208]:
                  - generic [ref=e209]: Grade 7
                  - generic [ref=e210]: NCERT
                - generic [ref=e211]: Mathematics
                - generic [ref=e212]:
                  - text: Explore
                  - img [ref=e213]
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
> 91  |     const trackRequestPromise = page.waitForRequest(request => 
      |                                      ^ Error: page.waitForRequest: Test timeout of 30000ms exceeded.
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