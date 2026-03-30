# 🚀 Chapter Dropdown Fix - Deployment Instructions

**Date:** 2026-03-30  
**Status:** ✅ CODE READY FOR DEPLOYMENT  
**Build:** SUCCESSFUL

---

## Changes Made

### Backend (2 files)
1. **QuestionController.java** - Added `classLevel` parameter to `/chapters` endpoint
2. **QuestionService.java** - Added classLevel filter to `getDistinctChapters()` method

### Frontend (2 files)
1. **src/lib/api/questions.ts** - Updated `getChapters()` to accept classLevel
2. **src/app/teacher/question-bank/page.tsx** - Pass classLevel when fetching chapters

---

## Build Status

✅ **Backend build successful**
```
cd /Users/anuraagpatil/naviksha/Shiksha Sathi/backend
./gradlew clean build -x test
BUILD SUCCESSFUL in 6s
```

**Artifacts ready:**
- `backend/api/build/libs/api.jar`
- `backend/api/build/boot/api.jar`

---

## Deployment Options

### Option 1: Deploy via Cloud Console (Recommended)

1. **Navigate to Cloud Build:**
   - Visit: https://console.cloud.google.com/cloud-build
   - Project: `vikrants-projects-9bdd0967`

2. **Create New Build:**
   - Click "CREATE BUILD"
   - Source: Upload `backend/` folder or connect to GitHub
   - Config: Use existing `cloudbuild.yaml` or create new

3. **Deploy to Cloud Run:**
   - Service: `shiksha-sathi-backend`
   - Region: `asia-south1`
   - Image: Auto-generated from build

4. **Wait for deployment** (~5-10 minutes)

5. **Test:**
   ```bash
   curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=7"
   ```
   **Expected:** 15 chapters (NO Vector Algebra)

---

### Option 2: Deploy via gcloud CLI (Requires Permissions)

**Prerequisites:**
- Access to project `vikrants-projects-9bdd0967`
- Cloud Run Admin role
- Service account with Cloud Run permissions

**Commands:**
```bash
# Set active project
gcloud config set project vikrants-projects-9bdd0967

# Navigate to backend
cd /Users/anuraagpatil/naviksha/Shiksha Sathi/backend

# Deploy
gcloud run deploy shiksha-sathi-backend \
  --source . \
  --platform managed \
  --region asia-south1 \
  --project vikrants-projects-9bdd0967 \
  --allow-unauthenticated
```

**If permission error:**
Contact project owner to grant:
- `roles/run.admin` (Cloud Run Admin)
- `roles/artifactregistry.writer` (Artifact Registry Writer)

---

### Option 3: Docker Build & Deploy

```bash
# Build Docker image
cd /Users/anuraagpatil/naviksha/Shiksha Sathi/backend
docker build -t gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest .

# Push to Container Registry
docker push gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest

# Deploy to Cloud Run
gcloud run deploy shiksha-sathi-backend \
  --image gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest \
  --platform managed \
  --region asia-south1 \
  --project vikrants-projects-9bdd0967 \
  --allow-unauthenticated
```

---

## Testing After Deployment

### API Test 1: Class 7 Mathematics
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=7" | python3 -m json.tool
```

**Expected Response (15 chapters):**
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

**NOT Expected:** "Vector Algebra" ❌

---

### API Test 2: Class 12 Mathematics
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=12" | python3 -m json.tool
```

**Expected Response (10 chapters, INCLUDES Vector Algebra):**
```json
[
  "Chapter 1: Relations and Functions",
  "Chapter 2: Inverse Trigonometric Functions",
  ...
  "Chapter 10: Vector Algebra",  ← Should be here
  ...
]
```

---

### Frontend Test

1. **Navigate to:** https://shiksha-sathi-taupe.vercel.app/teacher/question-bank

2. **Select filters:**
   - Board: NCERT
   - Class: 7
   - Subject: Mathematics

3. **Check chapter dropdown:**
   - ✅ Should show 15 chapters for Class 7
   - ❌ Should NOT show "Vector Algebra"

4. **Select chapter:**
   - Chapter 9: Rational Numbers
   - ✅ Should show 4 questions with "SOURCE: CANONICAL"

5. **Test Class 12:**
   - Change Class to: 12
   - Chapter dropdown should update
   - ✅ Should now show "Vector Algebra" (4 questions)

---

## Rollback Plan

If issues occur after deployment:

```bash
# Rollback to previous revision
gcloud run services update-traffic shiksha-sathi-backend \
  --to-revisions=PREVIOUS_REVISION_ID=100 \
  --platform managed \
  --region asia-south1 \
  --project vikrants-projects-9bdd0967
```

---

## Success Criteria

- [ ] Backend deployed successfully
- [ ] API returns filtered chapters by classLevel
- [ ] Class 7 Mathematics shows 15 chapters (no Vector Algebra)
- [ ] Class 12 Mathematics shows 10 chapters (includes Vector Algebra)
- [ ] Frontend chapter dropdown updates when class changes
- [ ] No "No questions found" errors from invalid chapter selections

---

## Monitoring

After deployment, monitor:

1. **Cloud Run Logs:**
   - https://console.cloud.google.com/logs
   - Filter by: `shiksha-sathi-backend`
   - Watch for errors in `/chapters` endpoint

2. **Frontend Analytics:**
   - Watch for reduced "No questions found" errors
   - Monitor chapter selection patterns

3. **User Feedback:**
   - Collect feedback from teachers using question bank
   - Verify improved UX

---

**Last Updated:** 2026-03-30  
**Status:** ✅ Ready for deployment  
**Build:** SUCCESSFUL  
**Next Step:** Deploy backend to Cloud Run
