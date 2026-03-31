# 🔧 Backend MongoDB Connection Fix

**Date:** 2026-03-31  
**Issue:** Backend trying to connect to `localhost:27017` instead of MongoDB Atlas  
**Status:** ✅ FIXED

---

## Problem

When running `npm run dev`, the backend was trying to connect to MongoDB localhost:
```
com.mongodb.MongoSocketOpenException: Exception opening socket
    at java.net.ConnectException: Connection refused
    at localhost:27017
```

**Root Cause:** The `.env.local` file is only loaded by Next.js (frontend), not by the Spring Boot backend.

---

## Solution

### Option 1: Automatic (Recommended) ✅

The backend now automatically loads from `backend/api/src/main/resources/.env`

**Setup (One-time):**
```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"

# Copy MongoDB URI to backend
grep MONGODB_URI .env.local > backend/api/src/main/resources/.env

# Verify
cat backend/api/src/main/resources/.env
# Should show: MONGODB_URI="mongodb+srv://..."
```

**Then run:**
```bash
npm run dev
```

Backend will now connect to MongoDB Atlas automatically! ✅

---

### Option 2: Manual Environment Variable

**Set environment variable before running:**
```bash
# Export MongoDB URI
export MONGODB_URI="mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha"

# Then run dev
npm run dev
```

---

### Option 3: Use Backend Script

```bash
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend"
./run-with-env.sh
```

This script loads `.env.local` and starts the backend.

---

## Verification

After starting the backend, you should see:
```
2026-03-31T10:43:07.372+05:30  INFO 511 --- [shikshasathi-backend] 
o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path '/'
2026-03-31T10:43:07.382+05:30  INFO 511 --- [shikshasathi-backend] 
c.s.backend.BackendApplication           : Started BackendApplication in 1.902 seconds
```

**No more "Connection refused" errors!** ✅

---

## Test Backend Connection

```bash
# Test backend API
curl http://localhost:8080/api/v1/questions/boards

# Expected response:
["NCERT"]
```

---

## Files Changed

| File | Purpose |
|------|---------|
| `backend/api/src/main/resources/.env` | MongoDB URI for backend |
| `backend/run-with-env.sh` | Script to load env and run backend |
| `package.json` | Updated dev:backend script |

---

## For Production Deployment

**Vercel (Frontend):**
- Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Already configured ✅

**Cloud Run (Backend):**
- Set `MONGODB_URI` in Cloud Run environment variables
- Already configured ✅

---

## Troubleshooting

### Backend still shows localhost error

**Check:**
```bash
# Verify .env file exists
ls -la backend/api/src/main/resources/.env

# Check content
cat backend/api/src/main/resources/.env
```

**Fix:**
```bash
# Recreate .env file
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
grep MONGODB_URI .env.local > backend/api/src/main/resources/.env
```

### JWT_SECRET error

If you see JWT secret warnings, add to `.env`:
```bash
JWT_SECRET="your-secret-key-here"
```

Then copy to backend:
```bash
grep JWT_SECRET .env.local >> backend/api/src/main/resources/.env
```

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Backend connects to MongoDB Atlas correctly  
**Next:** Run `npm run dev` and both frontend + backend should work!
