# 🔴 DEPLOYMENT ANALYSIS - Why Fix Isn't Working

**Date:** 2026-03-30  
**Status:** ❌ DEPLOYMENT FAILED - OLD CODE DEPLOYED  
**Root Cause:** Deployed artifact doesn't contain the fix

---

## Verification Results

### ✅ Source Code Has Fix
```java
// QuestionController.java - Line 42-46
public ResponseEntity<List<String>> getChapters(
        @RequestParam(required = false) String subjectId,
        @RequestParam(required = false) String book,
        @RequestParam(required = false) String classLevel) {  // ← THIS EXISTS
    return ResponseEntity.ok(questionService.getDistinctChapters(subjectId, book, classLevel));
}
```

### ❌ Deployed Backend Still Returns 83 Chapters
```bash
curl "https://shiksha-sathi-backend-198875791604.asia-south1.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=11"
# Returns: 83 chapters (OLD behavior)
# Expected: 10 chapters (NEW behavior)
```

---

## Root Cause Analysis

### What Likely Happened

**Scenario 1: Deployed Old Docker Image** ❌
```bash
# If you ran this:
docker push ... # with old image
gcloud run deploy --image gcr.io/.../shiksha-sathi-backend:latest
```
The `:latest` tag pointed to an OLD image built before the fix.

**Scenario 2: Deployed Source Without Rebuilding** ❌
```bash
# If you deployed the backend/ folder directly:
gcloud run deploy --source ./backend
```
Cloud Build used cached Gradle artifacts instead of rebuilding.

**Scenario 3: Deployed to Different Service** ❌
```bash
# The URL suggests a different service:
https://shiksha-sathi-backend-198875791604.asia-south1.run.app
#                                    ^^^^^^^^^^^^^^^
# This is NOT the original service name
```

---

## Correct Deployment Process

### Step 1: Rebuild Backend (CRITICAL)

```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend"

# Clean previous builds
./gradlew clean

# Build fresh artifacts
./gradlew bootJar -x test

# Verify build succeeded
ls -la api/build/libs/*.jar
# Should show: api-0.0.1-SNAPSHOT.jar (timestamp: today)
```

### Step 2: Build NEW Docker Image

```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend"

# Build with NEW tag (not :latest)
docker build -t gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:chapter-fix-$(date +%Y%m%d-%H%M%S) .

# Tag as latest
docker tag gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:chapter-fix-... gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest

# Push to Container Registry
docker push gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest
```

### Step 3: Deploy to CORRECT Service

**Check which service is correct:**

Option A: Original service
```bash
https://shiksha-sathi-backend-eyfdit56la-el.a.run.app
```

Option B: New service you created
```bash
https://shiksha-sathi-backend-198875791604.asia-south1.run.app
```

**Deploy to the service your frontend is using:**

```bash
gcloud run deploy shiksha-sathi-backend \
  --image gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest \
  --platform managed \
  --region asia-south1 \
  --project vikrants-projects-9bdd0967 \
  --allow-unauthenticated
```

### Step 4: Verify Deployment

```bash
# Test Class 11 Mathematics
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=11" | python3 -m json.tool

# Expected: 10 chapters
# - Chapter 1: Sets
# - Chapter 2: Relations and Functions
# - Chapter 3: Trigonometric Functions
# - Chapter 4: Principle of Mathematical Induction
# - Chapter 5: Complex Numbers and Quadratic Equations
# - Chapter 6: Linear Inequalities
# - Chapter 7: Permutations and Combinations
# - Chapter 8: Binomial Theorem
# - Chapter 9: Sequences and Series
# - Chapter 10: Straight Lines

# NOT Expected: 83 chapters with Vector Algebra, Circles, etc.
```

---

## Cloud Console Deployment (RECOMMENDED)

### Via Cloud Build

1. **Navigate to:** https://console.cloud.google.com/cloud-build

2. **Click "CREATE BUILD"**

3. **Source:**
   - Select "GitHub (Cloud Build GitHub App)"
   - Repository: `vikrantshome/Shiksha-Sathi`
   - Branch: `main`
   - Directory: `backend/`

4. **Build Configuration:**
   - Click "Dockerfile"
   - Ensure it uses the Dockerfile in `backend/`

5. **Advanced Settings:**
   - Images: `gcr.io/vikrants-projects-9bdd0967/shiksha-sathi-backend:latest`
   - Check "Replace existing image"

6. **Click "CREATE"**

7. **Wait for build** (~10 minutes)

8. **Deploy to Cloud Run:**
   - Go to: https://console.cloud.google.com/run
   - Select service (check which one your frontend uses)
   - Click "Edit & Deploy New Revision"
   - Select the NEW image you just built
   - Click "Deploy"

---

## Critical Checks

### ✅ Check 1: Build Timestamp
```bash
ls -la "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend/api/build/libs/"
# Jar file should have timestamp from AFTER you made the code changes
```

### ✅ Check 2: Service Name Match
```bash
# Check which service your frontend is calling
grep "NEXT_PUBLIC_API_URL" "/Users/anuraagpatil/naviksha/Shiksha Sathi/.env.local"

# Make sure you deploy to THAT service
```

### ✅ Check 3: Region Match
```bash
# All deployments must be to asia-south1
# Check your existing service region in Cloud Console
```

### ✅ Check 4: Image Digest
```bash
# After deployment, check the image digest
gcloud run services describe shiksha-sathi-backend \
  --region asia-south1 \
  --format="value(status.latestCreatedRevisionName)"
```

---

## Why Your Deployment Didn't Work

### Possible Issue 1: Wrong Service
You deployed to:
```
shiksha-sathi-backend-198875791604
```

But frontend might be using:
```
shiksha-sathi-backend-eyfdit56la-el
```

**Fix:** Check `.env.local` for `NEXT_PUBLIC_API_URL`

### Possible Issue 2: Cached Build
Cloud Build cached old Gradle artifacts.

**Fix:** Add `./gradlew clean` before build

### Possible Issue 3: Old Docker Image
You deployed an image built before the code changes.

**Fix:** Rebuild Docker image AFTER code changes

### Possible Issue 4: Frontend Not Updated
Frontend code changes exist but aren't deployed to Vercel.

**Fix:** Trigger Vercel redeploy:
```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
vercel --prod
```

---

## Complete Fix Checklist

- [ ] Backend code has `classLevel` parameter ✅ (VERIFIED)
- [ ] Backend rebuilt with `./gradlew clean bootJar` ⏳
- [ ] NEW Docker image built and pushed ⏳
- [ ] Deployed to CORRECT service (check frontend URL) ⏳
- [ ] Deployed to CORRECT region (asia-south1) ⏳
- [ ] API returns 10 chapters for Class 11 ⏳
- [ ] Frontend chapter dropdown filtered ⏳
- [ ] Frontend redeployed to Vercel ⏳

---

## Immediate Action Required

1. **Check which backend URL frontend uses:**
   ```bash
   grep "NEXT_PUBLIC_API_URL" "/Users/anuraagpatil/naviksha/Shiksha Sathi/.env.local"
   ```

2. **Rebuild backend:**
   ```bash
   cd "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend"
   ./gradlew clean bootJar -x test
   ```

3. **Deploy via Cloud Console:**
   - https://console.cloud.google.com/run
   - Select the service from step 1
   - Deploy NEW revision with rebuilt image

4. **Verify:**
   ```bash
   curl "<YOUR_BACKEND_URL>/api/v1/questions/chapters?subjectId=Mathematics&classLevel=11"
   # Should return 10 chapters
   ```

---

**Last Updated:** 2026-03-30  
**Priority:** 🔴 CRITICAL  
**Next Step:** Rebuild backend and deploy to CORRECT service
