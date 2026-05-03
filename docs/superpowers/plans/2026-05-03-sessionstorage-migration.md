# Remove Cookies and Convert All Storage to sessionStorage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate all cookie usage for auth and convert all localStorage to sessionStorage for complete tab isolation.

**Architecture:** Convert 8 teacher server pages to client components so they can read sessionStorage directly. Remove cookie infrastructure entirely. Convert 3 localStorage uses to sessionStorage.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5

---

## File Inventory

### Files to Modify (cookie removal)
- `src/lib/api/client.ts` — remove `getServerToken()` and `next/headers` import
- `src/app/login/page.tsx` — remove 2 `document.cookie` lines
- `src/app/student/login/page.tsx` — remove 2 `document.cookie` lines
- `src/lib/api/auth.ts` — remove cookie clearing from `logout()`

### Files to Modify (localStorage → sessionStorage)
- `src/components/AssignmentContext.tsx` — change storage mechanism
- `src/components/QuizContext.tsx` — change storage mechanism
- `src/lib/api/students.ts` — change storage mechanism

### Files to Modify (server → client components)
- `src/app/teacher/dashboard/page.tsx`
- `src/app/teacher/assignments/page.tsx`
- `src/app/teacher/classes/page.tsx`
- `src/app/teacher/classes/[id]/students/page.tsx`
- `src/app/teacher/quizzes/create/page.tsx`
- `src/app/teacher/quizzes/[quizId]/page.tsx`
- `src/app/teacher/quizzes/page.tsx`
- `src/app/teacher/profile/page.tsx`

### Files to Modify (docs/tests)
- `src/middleware.ts` — update comment
- `e2e/tab-isolation.spec.ts` — add cookie absence assertion
- `doc/frontend-state-management.md` — remove cookie references, update diagram

---

## Task 1: Remove Cookie Infrastructure from API Client

**Files:**
- Modify: `src/lib/api/client.ts`

- [ ] **Step 1: Remove getServerToken() and simplify fetchApi**

Delete the `getServerToken()` function and its dynamic import. `fetchApi` should only read from `sessionStorage`.

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | undefined;

  if (typeof window !== 'undefined') {
    token = sessionStorage.getItem('shiksha-sathi-token') ?? undefined;
  }

  const headers = new Headers(options.headers);
  const isAuthEndpoint = path === '/auth/login' || path === '/auth/signup';
  if (token && !isAuthEndpoint) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.error || 'An unexpected error occurred';
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd "/Users/anuraagpatil/naviksha/Shiksha Sathi" && npx tsc --noEmit`
Expected: PASS (no type errors from removed function)

- [ ] **Step 3: Commit**

```bash
git add src/lib/api/client.ts
git commit -m "refactor(auth): remove getServerToken() and cookie support from fetchApi

Eliminates server-side cookie auth path. All token reads now come
from sessionStorage exclusively."
```

---

## Task 2: Remove Cookie Setting from Login Pages

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/student/login/page.tsx`
- Modify: `src/lib/api/auth.ts`

- [ ] **Step 1: Remove cookie lines from login/page.tsx**

Remove these two lines (around line 49 and 112):
```typescript
// Also set cookie so server components can authenticate
document.cookie = `auth-token=${response.token}; path=/; max-age=86400; SameSite=Lax`;
```

Keep the `sessionStorage.setItem('shiksha-sathi-token', response.token)` lines.

- [ ] **Step 2: Remove cookie lines from student/login/page.tsx**

Same as above — remove the two `document.cookie` lines.

- [ ] **Step 3: Remove cookie clearing from auth.ts**

In `src/lib/api/auth.ts`, remove:
```typescript
// Clear cookie so server components no longer authenticate
document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
```

Keep the `sessionStorage.removeItem('shiksha-sathi-token')` line.

- [ ] **Step 4: Run lint**

Run: `cd "/Users/anuraagpatil/naviksha/Shiksha Sathi" && npx eslint src/app/login/page.tsx src/app/student/login/page.tsx src/lib/api/auth.ts`
Expected: PASS with zero cookie references

- [ ] **Step 5: Commit**

```bash
git add src/app/login/page.tsx src/app/student/login/page.tsx src/lib/api/auth.ts
git commit -m "refactor(auth): remove auth-token cookie from login and logout

All auth token storage now uses sessionStorage exclusively.
Removes document.cookie assignments from login pages and
logout handler."
```

---

## Task 3: Convert AssignmentContext to sessionStorage

**Files:**
- Modify: `src/components/AssignmentContext.tsx`

- [ ] **Step 1: Replace localStorage with sessionStorage**

Change all `localStorage.getItem` → `sessionStorage.getItem`, `localStorage.setItem` → `sessionStorage.setItem`.

- [ ] **Step 2: Commit**

```bash
git add src/components/AssignmentContext.tsx
git commit -m "refactor(storage): convert AssignmentContext to sessionStorage

Assignment question selection is now tab-isolated."
```

---

## Task 4: Convert QuizContext to sessionStorage

**Files:**
- Modify: `src/components/QuizContext.tsx`

- [ ] **Step 1: Replace localStorage with sessionStorage**

Same pattern as Task 3.

- [ ] **Step 2: Commit**

```bash
git add src/components/QuizContext.tsx
git commit -m "refactor(storage): convert QuizContext to sessionStorage

Quiz question selection is now tab-isolated."
```

---

## Task 5: Convert Student Identity Storage to sessionStorage

**Files:**
- Modify: `src/lib/api/students.ts`

- [ ] **Step 1: Replace localStorage with sessionStorage**

Change `localStorage.getItem` → `sessionStorage.getItem`, etc.

- [ ] **Step 2: Commit**

```bash
git add src/lib/api/students.ts
git commit -m "refactor(storage): convert student identity persistence to sessionStorage

Student identity is now tab-isolated instead of cross-tab shared."
```

---

## Task 6: Convert Teacher Dashboard to Client Component

**Files:**
- Modify: `src/app/teacher/dashboard/page.tsx`

- [ ] **Step 1: Add "use client" and convert to function component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AssignmentWithStats } from "@/lib/api/types";
import Link from "next/link";
import Loader from "@/components/Loader";
```

Convert `async function TeacherDashboard()` to `function TeacherDashboard()` with `useState` and `useEffect`.

- [ ] **Step 2: Move API calls to useEffect**

```typescript
const [user, setUser] = useState(null);
const [assignments, setAssignments] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let cancelled = false;
  
  const load = async () => {
    try {
      const userData = await api.auth.getMe();
      if (cancelled) return;
      setUser(userData);
      
      if (userData) {
        const stats = await api.assignments.getStats(userData.id);
        if (cancelled) return;
        setAssignments(stats);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      if (!cancelled) setLoading(false);
    }
  };
  
  load();
  return () => { cancelled = true; };
}, []);

if (loading) return <Loader />;
```

- [ ] **Step 3: Commit**

```bash
git add src/app/teacher/dashboard/page.tsx
git commit -m "refactor(teacher): convert dashboard to client component

Removes server-side data fetching dependency on cookies.
Now uses sessionStorage auth via useEffect."
```

---

## Task 7: Convert Remaining 7 Teacher Pages to Client Components

**Files:**
- Modify: `src/app/teacher/assignments/page.tsx`
- Modify: `src/app/teacher/classes/page.tsx`
- Modify: `src/app/teacher/classes/[id]/students/page.tsx`
- Modify: `src/app/teacher/quizzes/create/page.tsx`
- Modify: `src/app/teacher/quizzes/[quizId]/page.tsx`
- Modify: `src/app/teacher/quizzes/page.tsx`
- Modify: `src/app/teacher/profile/page.tsx`

- [ ] **Step 1: Apply same pattern to all 7 pages**

For each page:
1. Add `"use client"` at top
2. Add `import { useEffect, useState } from "react"`
3. Add `import Loader from "@/components/Loader"` if not present
4. Convert `async function PageName()` to `function PageName()`
5. Wrap API calls in `useEffect(() => { ... }, [])`
6. Add loading state
7. Remove the "Server components cannot access sessionStorage" comment

- [ ] **Step 2: Commit**

```bash
git add src/app/teacher/assignments/page.tsx src/app/teacher/classes/page.tsx src/app/teacher/classes/[id]/students/page.tsx src/app/teacher/quizzes/create/page.tsx src/app/teacher/quizzes/[quizId]/page.tsx src/app/teacher/quizzes/page.tsx src/app/teacher/profile/page.tsx
git commit -m "refactor(teacher): convert all teacher pages to client components

All 7 remaining teacher pages now use client-side data fetching
with sessionStorage auth. Removes dependency on auth cookies."
```

---

## Task 8: Update Middleware Comments

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update comment**

Change the comment to remove cookie references:
```typescript
export function middleware(request: NextRequest) {
  // Auth is handled client-side via sessionStorage.
  // Server validates via Authorization header.
  // Client-side AuthSessionGuard handles route protection.
  return NextResponse.next();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "docs(middleware): update auth comments to reflect sessionStorage-only"
```

---

## Task 9: Update E2E Tests

**Files:**
- Modify: `e2e/tab-isolation.spec.ts`

- [ ] **Step 1: Add cookie absence assertion**

After login, assert that `document.cookie` does NOT contain `auth-token`:

```typescript
// Verify NO cookie is set (sessionStorage only)
const cookies = await page1.evaluate(() => document.cookie);
expect(cookies).not.toContain('auth-token');
```

- [ ] **Step 2: Commit**

```bash
git add e2e/tab-isolation.spec.ts
git commit -m "test(e2e): assert no auth-token cookie is set after login

Ensures sessionStorage-only auth strategy."
```

---

## Task 10: Update Documentation

**Files:**
- Modify: `doc/frontend-state-management.md`

- [ ] **Step 1: Remove cookie references**

- Delete the Token Storage Strategy diagram showing cookies
- Remove the `getServerToken()` code block
- Update the state flow diagram to remove cookie path
- Update the Storage Keys Summary table: all entries now sessionStorage
- Update Best Practices: remove cookie warnings, update examples

- [ ] **Step 2: Commit**

```bash
git add doc/frontend-state-management.md
git commit -m "docs: update state management docs for sessionStorage-only

Removes all cookie references. All storage is now sessionStorage."
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run full typecheck**

Run: `cd "/Users/anuraagpatil/naviksha/Shiksha Sathi" && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 2: Run full lint**

Run: `cd "/Users/anuraagpatil/naviksha/Shiksha Sathi" && npm run lint`
Expected: PASS with zero cookie/localStorage auth references

- [ ] **Step 3: Verify no cookie references remain**

Run: `cd "/Users/anuraagpatil/naviksha/Shiksha Sathi" && grep -r "auth-token\|getServerToken\|document.cookie\|next/headers\|cookies()" src/ e2e/ doc/ --include="*.{ts,tsx,md}" || echo "No cookie references found ✓"`
Expected: "No cookie references found ✓"

- [ ] **Step 4: Verify no localStorage auth references remain**

Run: `cd "/Users/anuraagpatil/naviksha/Shiksha Sathi" && grep -r "localStorage" src/ e2e/ --include="*.{ts,tsx}" || echo "No localStorage references found ✓"`
Expected: Should show only non-auth uses (if any)

- [ ] **Step 5: Commit final verification log**

```bash
git log --oneline -15
```

---

## Summary of Changes

| Category | Files Changed | Impact |
|----------|---------------|--------|
| Cookie removal | 4 files | Auth now sessionStorage-only |
| localStorage → sessionStorage | 3 files | All storage tab-isolated |
| Server → Client components | 8 files | Teacher pages use client auth |
| Tests | 1 file | Asserts no cookies |
| Docs | 1 file | Reflects new architecture |

**Total:** 17 files modified, 0 files created.
