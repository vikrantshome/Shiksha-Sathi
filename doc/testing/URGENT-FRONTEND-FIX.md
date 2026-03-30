# 🔴 URGENT: Frontend Deployment Failed - Environment Variable Fix Required

**Date:** 2026-03-30  
**Status:** ❌ DEPLOYMENT ERROR  
**Error:** Server component render error  
**Cause:** Missing `NEXT_PUBLIC_API_URL` environment variable in Vercel

---

## Error Details

**Error Message:**
```
This page couldn't load
A server error occurred. Reload to try again.

Uncaught Error: An error occurred in the Server Components render.
```

**Root Cause:**
Vercel production environment has:
- ✅ `NEXT_PUBLIC_BACKEND_URL` (exists)
- ❌ `NEXT_PUBLIC_API_URL` (MISSING - this is what the app uses!)

---

## Immediate Fix Required

### Option 1: Vercel Console (RECOMMENDED - Fastest)

1. **Visit:** https://vercel.com/vikrantshomes-projects/shiksha-sathi/settings/environment-variables

2. **Add New Variable:**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
   - **Click:** "Save"

3. **Redeploy:**
   - Go to: https://vercel.com/vikrantshomes-projects/shiksha-sathi
   - Find latest deployment
   - Click "Redeploy"
   - Wait ~2-3 minutes

### Option 2: Vercel CLI (If Authenticated)

```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL "https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1" production

# Confirm when prompted:
# - Mark as sensitive? N (it's a public URL)
# - Add to Preview? Y
# - Add to Development? Y

# Redeploy
vercel --prod
```

---

## Why This Happened

**Vercel has these environment variables:**
```
✅ NEXT_PUBLIC_BACKEND_URL = https://shiksha-sathi-backend-198875791604...
❌ NEXT_PUBLIC_API_URL = MISSING
```

**But the app uses:**
```typescript
// src/lib/api/questions.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL
```

**Result:** API calls fail because `NEXT_PUBLIC_API_URL` is undefined

---

## Verification After Fix

### 1. Check Environment Variable

**Via Vercel Console:**
- Visit: https://vercel.com/vikrantshomes-projects/shiksha-sathi/settings/environment-variables
- Verify `NEXT_PUBLIC_API_URL` exists for Production

**Via CLI:**
```bash
vercel env ls
# Should show NEXT_PUBLIC_API_URL for Production
```

### 2. Test Frontend

1. **Visit:** https://shiksha-sathi-taupe.vercel.app/teacher/question-bank
2. **Should load without errors**
3. **Select filters:**
   - Board: NCERT
   - Class: 11
   - Subject: Mathematics
4. **Check chapter dropdown** (will show all chapters until backend is redeployed)

---

## Complete Deployment Checklist

- [ ] Add `NEXT_PUBLIC_API_URL` to Vercel Production ✅ IN PROGRESS
- [ ] Add `NEXT_PUBLIC_API_URL` to Vercel Preview ✅ RECOMMENDED
- [ ] Redeploy frontend to Production ⏳ PENDING
- [ ] Verify frontend loads without errors ⏳ PENDING
- [ ] Redeploy backend with chapter filter fix ⏳ PENDING
- [ ] Test chapter dropdown filtering ⏳ PENDING

---

## Current Deployment URLs

| Environment | URL | Status |
|-------------|-----|--------|
| Production | https://shiksha-sathi-taupe.vercel.app | ❌ Broken (missing env var) |
| Preview | https://shiksha-sathi-kr8utinxd-vikrants-projects-9bdd0967.vercel.app | ⚠️ Preview only |
| Backend | https://shiksha-sathi-backend-198875791604.asia-south1.run.app | ⏳ Needs code redeploy |

---

## After Environment Fix

Once `NEXT_PUBLIC_API_URL` is added and frontend is redeployed:

### Test API Directly
```bash
curl "https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=11"
```

**Current (broken):** Returns 83 chapters  
**After backend redeploy:** Should return 10 chapters

### Test Frontend
1. Visit: https://shiksha-sathi-taupe.vercel.app/teacher/question-bank
2. Select: Class=11, Subject=Mathematics
3. **Current:** Shows all 83 chapters
4. **After backend redeploy:** Shows only 10 chapters

---

## Priority Actions

### 🔴 CRITICAL (Do Now)
1. Add `NEXT_PUBLIC_API_URL` to Vercel Production
2. Redeploy frontend

### 🟡 HIGH (Today)
3. Redeploy backend with chapter filter fix
4. Verify chapter dropdown works

### 🟢 MEDIUM (This Week)
5. Promote preview to production URL
6. Test all class/subject combinations

---

## Contact

For immediate assistance:
- **Vercel Dashboard:** https://vercel.com/vikrantshomes-projects/shiksha-sathi
- **Cloud Run Console:** https://console.cloud.google.com/run

---

**Last Updated:** 2026-03-30  
**Priority:** 🔴 CRITICAL - Frontend is broken  
**Action Required:** Add `NEXT_PUBLIC_API_URL` environment variable in Vercel console
