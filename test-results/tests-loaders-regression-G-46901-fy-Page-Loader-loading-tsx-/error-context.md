# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/loaders-regression.spec.ts >> Global Loaders Regression Tests >> 4. Verify Page Loader (loading.tsx)
- Location: tests/loaders-regression.spec.ts:76:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 60000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/teacher/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Shiksha Sathi" [ref=e5] [cursor=pointer]:
        - /url: /
    - main [ref=e6]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Welcome Back
          - heading "Return to Your Studio" [level=1] [ref=e12]
          - paragraph [ref=e13]: Sign in to your Shiksha Sathi workspace to create assignments, monitor submissions, and keep your classroom rhythm on track.
        - generic [ref=e14]: Failed to fetch
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: Email Address
            - textbox "Email Address" [ref=e18]:
              - /placeholder: teacher@school.com
              - text: final@test.com
          - generic [ref=e19]:
            - generic [ref=e20]: Password
            - textbox "Password" [ref=e21]:
              - /placeholder: ••••••••
              - text: password123
          - button "Sign In to Workspace" [ref=e22]
        - paragraph [ref=e23]:
          - text: By continuing, you agree to Shiksha Sathi's
          - link "Terms of Service" [ref=e24] [cursor=pointer]:
            - /url: "#"
          - text: and
          - link "Privacy Policy" [ref=e25] [cursor=pointer]:
            - /url: "#"
          - text: .
        - generic [ref=e27]:
          - generic [ref=e28]: Need a teacher account?
          - link "Create one now" [ref=e29] [cursor=pointer]:
            - /url: /signup
      - paragraph [ref=e33]:
        - text: Curating the future
        - text: of educational
        - text: excellence.
  - alert [ref=e34]
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
> 21 |     await page.waitForURL('**/teacher/dashboard');
     |                ^ Error: page.waitForURL: Test timeout of 60000ms exceeded.
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
  49 |     await expect(loader.first()).toBeVisible();
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