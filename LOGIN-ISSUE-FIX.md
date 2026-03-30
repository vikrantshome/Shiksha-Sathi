# 🔧 Login Issue Fix - SSA-260

**Issue:** Authentication API returning "Invalid credentials"  
**Date:** 2026-03-30  
**Status:** ⚠️ BACKEND ISSUE IDENTIFIED

---

## Problem

```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qa_teacher_1@example.com","password":"password123"}'
  
# Response: {"error":"Invalid credentials"}
```

---

## Root Cause

The authentication endpoint path is **incorrect**. The correct endpoint is:

```
/api/v1/teachers/login (NOT /api/v1/auth/login)
```

---

## ✅ Solution - Use Correct Endpoint

### Step 1: Create Test Account (Signup)

```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA Teacher",
    "email": "qa_teacher_1@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "QA Teacher",
    "email": "qa_teacher_1@example.com",
    "role": "TEACHER"
  }
}
```

If you get `409 Conflict`, the account already exists - proceed to Step 2.

---

### Step 2: Login

```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qa_teacher_1@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "QA Teacher",
    "email": "qa_teacher_1@example.com",
    "role": "TEACHER"
  }
}
```

---

## 🧪 Test All Authentication Endpoints

### 1. Signup
```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123","phone":"+919876543210"}'
```

### 2. Login
```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Get Profile (Authenticated)
```bash
# Replace YOUR_TOKEN with actual token from login
curl -X GET https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Profile (Authenticated)
```bash
curl -X PUT https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"school":"Test School","board":"CBSE"}'
```

---

## 📋 API Endpoint Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/teachers/signup` | No | Create teacher account |
| POST | `/api/v1/teachers/login` | No | Login teacher |
| GET | `/api/v1/teachers/profile` | Yes | Get profile |
| PUT | `/api/v1/teachers/profile` | Yes | Update profile |

---

## 🌐 Public Endpoints (No Auth)

### Question Bank

```bash
# Get Boards
curl https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/boards

# Get Classes
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/classes?board=NCERT"

# Get Subjects
curl https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/subjects

# Search Questions
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/search?board=NCERT&classLevel=6&visibleOnly=true"
```

---

## 🔍 Troubleshooting

### Still Getting "Invalid credentials"?

1. **Check email spelling** - Must be exact: `qa_teacher_1@example.com`
2. **Check password** - Must be exact: `password123`
3. **Account doesn't exist** - Run signup first
4. **Backend down** - Check Cloud Run status

### Test with Simple Account

```bash
# Create a fresh test account
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'

# Then login
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

---

## 📞 Backend Support

**Backend Service:** Google Cloud Run  
**Service URL:** https://shiksha-sathi-backend-eyfdit56la-el.a.run.app  
**API Version:** v1  
**Documentation:** `/backend/api/` folder

---

## ✅ Quick Fix Summary

**WRONG:**
```bash
curl https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/login
```

**CORRECT:**
```bash
curl https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/login
```

**The `/auth/login` endpoint doesn't exist. Use `/teachers/login` instead.**

---

**Last Updated:** 2026-03-30  
**Status:** ⚠️ Use `/teachers/login` endpoint
