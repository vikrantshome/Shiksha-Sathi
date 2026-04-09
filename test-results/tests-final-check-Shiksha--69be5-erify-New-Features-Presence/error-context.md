# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/final-check.spec.ts >> Shiksha Sathi - Final Verification >> Verify New Features Presence
- Location: tests/final-check.spec.ts:8:7

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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
  4  | const PASSWORD = 'password123';
  5  | 
  6  | test.describe('Shiksha Sathi - Final Verification', () => {
  7  | 
  8  |   test('Verify New Features Presence', async ({ page }) => {
  9  |     // 1. LOGIN
  10 |     await page.goto(`${FRONTEND_URL}/login`);
  11 |     await page.fill('input[name="email"]', 'final@test.com');
  12 |     await page.fill('input[name="password"]', PASSWORD);
  13 |     await page.click('button[type="submit"]');
  14 |     await page.waitForURL('**/teacher/dashboard');
  15 | 
  16 |     // 2. VERIFY CLASSES & ENROLLMENT LINK
  17 |     await page.goto(`${FRONTEND_URL}/teacher/classes`);
  18 |     
  19 |     // Check if "Enroll Students" exists (we created a class in previous manual steps or tests)
  20 |     const enrollLink = page.locator('text=Enroll Students');
  21 |     if (await enrollLink.count() > 0) {
  22 |         await enrollLink.first().click();
  23 |         await page.waitForURL('**/students');
  24 |         await expect(page.locator('h1:has-text("Enroll Students")')).toBeVisible();
  25 |         console.log('✅ Student Enrollment UI is Live');
  26 |     } else {
  27 |         console.log('ℹ️ No classes found, skipping enrollment check');
  28 |     }
  29 | 
  30 |     // 3. VERIFY QUESTION BANK & POINTS
  31 |     await page.goto(`${FRONTEND_URL}/teacher/question-bank?chapter=Polynomials&board=CBSE&class=10&subject=Mathematics`);
  32 |     
  33 |     // Check if questions rendered
  34 |     const addBtn = page.locator('button[title="Add to assignment"]');
> 35 |     await expect(addBtn.first()).toBeVisible({ timeout: 15000 });
     |                                  ^ Error: expect(locator).toBeVisible() failed
  36 |     await addBtn.first().click();
  37 | 
  38 |     // Check Tray
  39 |     await expect(page.locator('text=Review Assignment')).toBeVisible();
  40 |     await page.click('text=Review Assignment');
  41 |     
  42 |     await page.waitForURL('**/assignments/create');
  43 |     
  44 |     // 4. VERIFY ADMIN UNPUBLISH UI
  45 |     await page.goto(`${FRONTEND_URL}/admin`);
  46 |     const publishedBtn = page.locator('button:has-text("PUBLISHED")');
  47 |     if (await publishedBtn.isVisible()) {
  48 |         await publishedBtn.click();
  49 |         const unpublishBtn = page.locator('button:has-text("Unpublish")');
  50 |         if (await unpublishBtn.count() > 0) {
  51 |             console.log('✅ Admin Unpublish UI is Live');
  52 |         }
  53 |     }
  54 | 
  55 |   });
  56 | 
  57 | });
  58 | 
```