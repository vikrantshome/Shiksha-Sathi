# 🐛 Backend API Redeploy Needed - sourceKind Issue

**Date:** 2026-03-30  
**Status:** ⚠️ REQUIRES BACKEND REDEPLOY  
**Priority:** HIGH

---

## Issue

**UI Shows:** "SOURCE: LOCAL" for all NCERT questions  
**Expected:** "SOURCE: CANONICAL"

---

## Root Cause

The **database has been updated** with `sourceKind: "CANONICAL"` for all 1,136 NCERT questions, but the **backend API is still returning `null`** because it's caching the old data or needs to be redeployed.

### Database Status ✅
```
Mathematics: 354 CANONICAL questions ✅
Science: 590 CANONICAL questions ✅
Physics: 80 CANONICAL questions ✅
Biology: 40 CANONICAL questions ✅
English: 48 CANONICAL questions ✅
Social Science: 24 CANONICAL questions ✅
```

### API Response ❌
```json
{
  "sourceKind": null  // Should be "CANONICAL"
}
```

---

## Evidence

### Database Query (Correct)
```javascript
db.questions.countDocuments({
  "provenance.class": "7",
  "provenance.subject": "Mathematics",
  sourceKind: "CANONICAL"
})
// Returns: 60 questions ✅
```

### API Response (Incorrect)
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/search?board=NCERT&classLevel=7&subjectId=Mathematics&chapter=Chapter%209%3A%20Rational%20Numbers&visibleOnly=true"
```
Returns: `sourceKind: null` ❌

---

## Solution

### Option 1: Redeploy Backend (Recommended)

**Google Cloud Run Redeploy:**

```bash
# Redeploy the backend service
gcloud run deploy shiksha-sathi-backend \
  --platform managed \
  --region asia-south1 \
  --image gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest
```

Or via Cloud Console:
1. Go to Cloud Run: https://console.cloud.google.com/run
2. Select `shiksha-sathi-backend`
3. Click "Edit & Deploy New Revision"
4. Click "Deploy"

### Option 2: Clear Backend Cache

If the backend uses caching (Redis, etc.), clear it:

```bash
# If using Redis
redis-cli FLUSHALL
```

### Option 3: Restart Backend Instance

Force Cloud Run to create new instances:

```bash
# Update environment variable to force restart
gcloud run services update shiksha-sathi-backend \
  --platform managed \
  --region asia-south1 \
  --update-env-vars RESTART_TIMESTAMP=$(date +%s)
```

---

## Verification After Redeploy

### 1. Test API
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/search?board=NCERT&classLevel=7&subjectId=Mathematics&chapter=Chapter%209%3A%20Rational%20Numbers&visibleOnly=true" | python3 -c "import sys, json; data=json.load(sys.stdin); print('SOURCE:', data[0].get('sourceKind') if data else 'No questions')"
```

**Expected:** `SOURCE: CANONICAL`

### 2. Test Frontend
1. Open: https://shiksha-sathi-taupe.vercel.app/teacher/question-bank
2. Select:
   - Board: NCERT
   - Class: 7
   - Subject: Mathematics
   - Chapter: Chapter 9: Rational Numbers
3. **Expected:** Questions show "SOURCE: CANONICAL"

---

## Available Questions by Class

### Mathematics
| Class | Chapters | Questions | Status |
|-------|----------|-----------|--------|
| 6 | 10 chapters | 40 | ✅ CANONICAL |
| 7 | 15 chapters | 60 | ✅ CANONICAL |
| 8 | 15 chapters | 60 | ✅ CANONICAL |
| 9 | 15 chapters | 60 | ✅ CANONICAL |
| 10 | 15 chapters | 60 | ✅ CANONICAL |
| 11 | 10 chapters | 40 | ✅ CANONICAL |
| 12 | 10 chapters | 40 | ✅ CANONICAL |

### Science
| Class | Chapters | Questions | Status |
|-------|----------|-----------|--------|
| 6-12 | Various | 590 | ✅ CANONICAL |

---

## Temporary Workaround

Until backend is redeployed, you can verify questions exist:

### Test with Class 10 Science (Working)
```
https://shiksha-sathi-taupe.vercel.app/teacher/question-bank?board=NCERT&class=10&subject=Science&chapter=Chapter%201%3A%20Chemical%20Reactions%20and%20Equations
```

Some Science questions might show "CANONICAL" correctly.

---

## Impact

**Affected Features:**
- All question bank browsing
- Assignment creation
- Question preview cards

**User Impact:**
- Questions display as "LOCAL" instead of "NCERT CANONICAL"
- Functionality works, but source attribution is incorrect

---

## Action Required

**Who:** Backend Team / DevOps  
**What:** Redeploy backend service on Google Cloud Run  
**When:** ASAP  
**Why:** Database updated but API returning cached/null values

---

**Last Updated:** 2026-03-30  
**Database Status:** ✅ All 1,136 questions marked CANONICAL  
**API Status:** ❌ Returning null for sourceKind  
**Fix:** Redeploy backend service
