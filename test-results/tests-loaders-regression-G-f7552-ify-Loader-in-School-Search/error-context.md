# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/loaders-regression.spec.ts >> Global Loaders Regression Tests >> 2. Verify Loader in School Search
- Location: tests/loaders-regression.spec.ts:41:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('svg.animate-spin').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('svg.animate-spin').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Shiksha Sathi" [ref=e5] [cursor=pointer]:
        - /url: /
    - main [ref=e6]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Join the Community
          - heading "Begin Your Journey" [level=1] [ref=e12]
          - paragraph [ref=e13]: Create your teacher workspace to publish assignments, guide student practice, and manage your classroom.
        - generic [ref=e14]:
          - generic [ref=e15]:
            - button "Teacher" [ref=e16]:
              - img [ref=e17]
              - text: Teacher
            - button "Student" [ref=e20]:
              - img [ref=e21]
              - text: Student
          - generic [ref=e24]:
            - generic [ref=e25]: Full Name *
            - textbox "Full Name *" [ref=e26]:
              - /placeholder: E.g. Dr. Ananya Rao
          - generic [ref=e27]:
            - generic [ref=e28]: School / Institute Name
            - textbox "e.g. Delhi Public School" [active] [ref=e29]: Delhi
          - generic [ref=e30]:
            - generic [ref=e31]: Phone Number *
            - textbox "Phone Number *" [ref=e32]:
              - /placeholder: "9876543210"
          - generic [ref=e33]:
            - generic [ref=e34]: Email Address
            - textbox "Email Address" [ref=e35]:
              - /placeholder: ananya@school.edu
          - generic [ref=e36]:
            - generic [ref=e37]: Password *
            - textbox "Password *" [ref=e38]:
              - /placeholder: ••••••••
          - button "Create Teacher Account" [ref=e39]
        - paragraph [ref=e40]:
          - text: By creating an account, you agree to Shiksha Sathi's
          - link "Terms of Service" [ref=e41] [cursor=pointer]:
            - /url: "#"
          - text: and
          - link "Privacy Policy" [ref=e42] [cursor=pointer]:
            - /url: "#"
          - text: .
        - generic [ref=e44]:
          - generic [ref=e45]: Already have an account?
          - link "Log in instead" [ref=e46] [cursor=pointer]:
            - /url: /login
      - paragraph [ref=e50]:
        - text: Curating the future
        - text: of educational
        - text: excellence.
  - alert [ref=e51]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4000';
  4  | const TEST_EMAIL = 'final@test.com';
  5  | const TEST_PASS = 'password123';
  6  | 
  7  | test.describe('Global Loaders Regression Tests', () => {
  8  | 
  9  |   test.beforeEach(async ({ page }) => {
  10 |     // Mock analytics track endpoint
  11 |     await page.route('**/api/v1/analytics/track', async route => {
  12 |       await route.fulfill({ json: { success: true } });
  13 |     });
  14 |   });
  15 | 
  16 |   async function login(page) {
  17 |     await page.goto(`${FRONTEND_URL}/login`);
  18 |     await page.fill('input[name="email"]', TEST_EMAIL);
  19 |     await page.fill('input[name="password"]', TEST_PASS);
  20 |     await page.click('button[type="submit"]');
  21 |     await page.waitForURL('**/teacher/dashboard');
  22 |   }
  23 | 
  24 |   test('1. Verify Loader in Question Bank Filtering', async ({ page }) => {
  25 |     await login(page);
  26 |     
  27 |     await page.goto(`${FRONTEND_URL}/teacher/question-bank`);
  28 |     
  29 |     // Select a board to trigger taxonomy reload
  30 |     await page.click('button:has-text("CBSE")');
  31 |     
  32 |     // Check for loader appearance
  33 |     const loader = page.locator('svg.animate-spin');
  34 |     // We expect the loader to appear (even if briefly)
  35 |     await expect(loader.first()).toBeVisible();
  36 |     
  37 |     // Wait for loader to disappear and content to load
  38 |     await expect(loader.first()).toBeHidden({ timeout: 15000 });
  39 |   });
  40 | 
  41 |   test('2. Verify Loader in School Search', async ({ page }) => {
  42 |     await page.goto(`${FRONTEND_URL}/signup`);
  43 |     
  44 |     const schoolInput = page.locator('input[placeholder*="e.g. Delhi Public"]');
  45 |     await schoolInput.fill('Delhi');
  46 |     
  47 |     // Check for "Searching..." loader in dropdown
  48 |     const loader = page.locator('svg.animate-spin');
> 49 |     await expect(loader.first()).toBeVisible();
     |                                  ^ Error: expect(locator).toBeVisible() failed
  50 |     
  51 |     // Wait for results
  52 |     await expect(loader.first()).toBeHidden({ timeout: 15000 });
  53 |   });
  54 | 
  55 |   test('3. Verify Button Loader in Login', async ({ page }) => {
  56 |     await page.goto(`${FRONTEND_URL}/login`);
  57 |     
  58 |     // Intercept login to slow it down and see the loader
  59 |     await page.route('**/api/v1/auth/login', async route => {
  60 |       await new Promise(resolve => setTimeout(resolve, 2000));
  61 |       await route.fulfill({ json: { token: 'mock-token', role: 'TEACHER' } });
  62 |     });
  63 | 
  64 |     await page.fill('input[name="email"]', 'test@example.com');
  65 |     await page.fill('input[name="password"]', 'password');
  66 |     await page.click('button[type="submit"]');
  67 |     
  68 |     // Check for spinner inside the button
  69 |     const buttonLoader = page.locator('button[type="submit"] svg.animate-spin');
  70 |     await expect(buttonLoader).toBeVisible();
  71 |     
  72 |     // Should eventually redirect
  73 |     await page.waitForURL('**/teacher/dashboard');
  74 |   });
  75 | 
  76 |   test('4. Verify Page Loader (loading.tsx)', async ({ page }) => {
  77 |     await login(page);
  78 |     
  79 |     // Slow down the classes fetch to trigger loading.tsx
  80 |     await page.route('**/api/v1/classes/me', async route => {
  81 |       await new Promise(resolve => setTimeout(resolve, 2000));
  82 |       await route.fulfill({ json: [] });
  83 |     });
  84 | 
  85 |     await page.click('a:has-text("Manage Classes")');
  86 |     
  87 |     // Next.js loading.tsx usually renders immediately on navigation
  88 |     const pageLoader = page.locator('svg.animate-spin');
  89 |     await expect(pageLoader).toBeVisible();
  90 |     
  91 |     // Wait for the actual page content
  92 |     await page.waitForURL('**/teacher/classes');
  93 |     await expect(pageLoader).toBeHidden();
  94 |   });
  95 | 
  96 | });
  97 | 
```