# 🚀 Backend Deployment Guide - Chapter Filter Fix

**Date:** 2026-03-30  
**Status:** ⚠️ REQUIRES MANUAL DEPLOYMENT  
**Build:** ✅ SUCCESSFUL

---

## ❗ Cloud MCP Deployment Failed

**Error:** Permission denied on Google Cloud project

The automated deployment via gcloud CLI requires project owner permissions that are not available in the current environment.

---

## ✅ Manual Deployment Steps

### Step 1: Navigate to Cloud Console

**Visit:** https://console.cloud.google.com/run

**Project:** Select `vikrants-projects-9bdd0967` from the project dropdown

---

### Step 2: Select Backend Service

1. Find service: `shiksha-sathi-backend`
2. Region: `asia-south1` (Mumbai)
3. Click on the service name

---

### Step 3: Deploy New Revision

1. Click **"Edit & Deploy New Revision"** button at top

2. **Container Image:**
   - Click on container name
   - Select **"Build from source"**
   - Or use existing image and just redeploy

3. **Source:**
   - Option A: Connect to GitHub repository
   - Option B: Upload `backend/` folder as ZIP
   - Option C: Use existing Docker image

4. **Click "Next"**

5. **Review configuration:**
   - Service name: `shiksha-sathi-backend`
   - Region: `asia-south1`
   - Allow unauthenticated invocations: ✅ CHECKED

6. **Click "Deploy"**

---

### Step 4: Wait for Deployment

**Expected time:** 5-10 minutes

**Monitor:**
- Click on the revision name
- View logs in "Logs" tab
- Wait for status: "Serving"

---

### Step 5: Verify Deployment

**Test API endpoint:**
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=7"
```

**Expected (15 chapters, NO Vector Algebra):**
```json
[
  "Chapter 1: Number Game",
  "Chapter 2: Data Handling",
  "Chapter 3: Data Handling",
  "Chapter 4: Triangles",
  "Chapter 5: Algebraic Expressions",
  "Chapter 6: The Triangle and its Properties",
  "Chapter 7: Congruence of Triangles",
  "Chapter 8: Comparing Quantities",
  "Chapter 9: Rational Numbers",
  "Chapter 10: Practical Geometry",
  "Chapter 11: Perimeter and Area",
  "Chapter 12: Data Handling",
  "Chapter 13: Algebraic Expressions",
  "Chapter 14: Symmetry",
  "Chapter 15: Visualising Solid Shapes"
]
```

---

## Alternative: GitHub Actions Deployment

If the project has GitHub Actions configured:

1. **Push code to GitHub** (already done ✅)
2. **Navigate to:** https://github.com/vikrantshome/Shiksha-Sathi/actions
3. **Select workflow:** "Deploy Backend" (if exists)
4. **Click "Run workflow"**
5. **Select branch:** `main`
6. **Click "Run workflow"**

---

## Alternative: Docker Deploy

If you have Docker and gcloud CLI with proper permissions:

```bash
# 1. Build Docker image
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend"
docker build -t gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest .

# 2. Push to Container Registry
docker push gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest

# 3. Deploy to Cloud Run
gcloud run deploy shiksha-sathi-backend \
  --image gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest \
  --platform managed \
  --region asia-south1 \
  --project vikrants-projects-9bdd0967 \
  --allow-unauthenticated
```

---

## Code Changes Ready

The following files have been updated and pushed to `main`:

### Backend
- ✅ `backend/api/src/main/java/com/shikshasathi/backend/api/controller/QuestionController.java`
- ✅ `backend/api/src/main/java/com/shikshasathi/backend/api/service/QuestionService.java`

### Frontend
- ✅ `src/lib/api/questions.ts`
- ✅ `src/app/teacher/question-bank/page.tsx`

### Build Artifacts
- ✅ `backend/api/build/libs/api.jar` (ready for deployment)

---

## What This Fix Does

**Before:**
- Chapter dropdown showed ALL chapters from ALL classes
- Class 7 students saw "Vector Algebra" (Class 12 chapter)
- Selecting invalid chapters showed "No questions found"

**After:**
- Chapter dropdown filtered by selected class
- Class 7 students see only Class 7 chapters (15 chapters)
- Class 12 students see Class 12 chapters (includes Vector Algebra)
- No more "No questions found" errors

---

## Post-Deployment Testing

### Test 1: Class 7 Mathematics
1. Go to: https://shiksha-sathi-taupe.vercel.app/teacher/question-bank
2. Select: Board=NCERT, Class=7, Subject=Mathematics
3. **Check chapter dropdown:**
   - ✅ Should show 15 chapters
   - ❌ Should NOT show "Vector Algebra"
4. Select: Chapter 9: Rational Numbers
5. **Expected:** 4 questions with "SOURCE: CANONICAL"

### Test 2: Class 12 Mathematics
1. Change Class to: 12
2. **Chapter dropdown should update**
3. **Should now include:** Vector Algebra
4. Select: Vector Algebra
5. **Expected:** 4 questions

### Test 3: Class Change
1. Start with Class 12, Mathematics
2. Note chapters shown (includes Vector Algebra)
3. Change to Class 7
4. **Expected:** Chapter dropdown updates, Vector Algebra removed

---

## Rollback (If Needed)

If issues occur after deployment:

1. **Go to:** https://console.cloud.google.com/run
2. **Select service:** `shiksha-sathi-backend`
3. **Click on current revision**
4. **Click "Manage Revisions"**
5. **Select previous working revision**
6. **Click "Set Traffic"** → 100% to old revision

---

## Contact

For deployment assistance, contact:
- Project owner: vikrantshome1995@gmail.com
- Check project permissions in: https://console.cloud.google.com/iam-admin/iam

---

**Last Updated:** 2026-03-30  
**Status:** ⚠️ Awaiting manual deployment  
**Code:** ✅ Ready on `main` branch  
**Build:** ✅ Successful
