# 🔧 Backend URL Updated - Action Required

**Date:** 2026-03-30  
**Status:** ✅ FRONTEND ENV UPDATED  
**Action:** Redeploy Frontend to Vercel

---

## Change Made

**Updated `.env.local`:**

```bash
# OLD (service doesn't exist)
NEXT_PUBLIC_API_URL=https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1

# NEW (correct service)
NEXT_PUBLIC_API_URL=https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1
```

---

## Required Actions

### Step 1: Update Vercel Environment Variable

**Via Vercel Console:**

1. **Visit:** https://vercel.com/vikrantshomes-projects/shiksha-sathi/settings/environment-variables
2. **Find variable:** `NEXT_PUBLIC_API_URL`
3. **Update value to:**
   ```
   https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1
   ```
4. **Click:** "Save"

**Via Vercel CLI:**

```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
vercel env add NEXT_PUBLIC_API_URL "https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1"
```

---

### Step 2: Redeploy Frontend

**Option A: Trigger Vercel Deploy (Recommended)**

```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
vercel --prod
```

**Option B: Via GitHub**

If Vercel is connected to GitHub:
1. Push any change to `main` branch
2. Vercel will auto-deploy

**Option C: Via Vercel Console**

1. Visit: https://vercel.com/vikrantshomes-projects/shiksha-sathi
2. Click "Redeploy" on latest deployment

---

### Step 3: Verify Deployment

**After Vercel deployment completes:**

1. **Visit:** https://shiksha-sathi-taupe.vercel.app/teacher/question-bank

2. **Select filters:**
   - Board: NCERT
   - Class: 11
   - Subject: Mathematics

3. **Check chapter dropdown:**
   - ✅ Should show ONLY 10 chapters for Class 11
   - ❌ Should NOT show 83 chapters from all classes

4. **Expected chapters:**
   - Chapter 1: Sets
   - Chapter 2: Relations and Functions
   - Chapter 3: Trigonometric Functions
   - Chapter 4: Principle of Mathematical Induction
   - Chapter 5: Complex Numbers and Quadratic Equations
   - Chapter 6: Linear Inequalities
   - Chapter 7: Permutations and Combinations
   - Chapter 8: Binomial Theorem
   - Chapter 9: Sequences and Series
   - Chapter 10: Straight Lines

---

## Why This Matters

**Before:**
- Frontend called non-existent backend service
- API calls failed or went to wrong service
- Chapter filtering didn't work

**After:**
- Frontend calls correct backend service
- API calls succeed
- Chapter filtering works (once backend is redeployed with fix)

---

## Backend Deployment Status

**Current Status:** ❌ Backend fix NOT yet deployed

**Next Step:** Redeploy backend to `shiksha-sathi-backend-198875791604` service

**Instructions:** See [`doc/testing/DEPLOYMENT-ANALYSIS.md`](DEPLOYMENT-ANALYSIS.md)

---

## Complete Fix Checklist

- [x] Backend code updated with `classLevel` filter ✅
- [x] Frontend `.env.local` updated ✅
- [ ] Vercel environment variable updated ⏳
- [ ] Frontend redeployed to Vercel ⏳
- [ ] Backend redeployed with fix ⏳
- [ ] API returns filtered chapters ⏳
- [ ] Chapter dropdown works correctly ⏳

---

**Priority:** 🔴 HIGH  
**Next Action:** Update Vercel environment variable and redeploy frontend
