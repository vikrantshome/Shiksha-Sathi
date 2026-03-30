# 🐛 Backend Authentication Bug Fix

**Issue:** Login returns "Cannot invoke Role.name() because User.getRole() is null"  
**Date:** 2026-03-30  
**Status:** ⚠️ REQUIRES DATABASE FIX  
**Affected Endpoint:** `/api/v1/auth/login`

---

## Root Cause

Existing teacher accounts in the database have `null` for the `role` field.

When the authentication service tries to generate a JWT token, it calls:
```java
user.getRole().name()  // Throws NullPointerException if role is null
```

---

## Solution Options

### Option 1: Database Fix (Recommended)

Update existing teacher records to have `TEACHER` role:

```javascript
// MongoDB Shell or Compass
db.users.updateMany(
  { email: { $regex: /@example\.com$/ }, role: null },
  { $set: { role: "TEACHER" } }
)
```

**Verify the fix:**
```javascript
db.users.findOne({ email: "qa_teacher_1@example.com" })
// Should show: { ..., role: "TEACHER", ... }
```

### Option 2: Backend Code Fix

Update the AuthService to handle null roles:

```java
// In AuthService.java
public AuthResponse authenticate(AuthRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
    
    // Add null check
    if (user.getRole() == null) {
        throw new IllegalStateException("User role not set");
    }
    
    // ... rest of authentication logic
}
```

### Option 3: Create New Account with Proper Role

Since signup with role works, create a fresh account:

```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Teacher",
    "email": "test.teacher@example.com",
    "password": "password123",
    "phone": "+919876543210",
    "role": "TEACHER"
  }'

# Then login
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.teacher@example.com",
    "password": "password123"
  }'
```

---

## Testing After Fix

### 1. Signup Test
```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+919876543210",
    "role": "TEACHER"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "TEACHER"
  }
}
```

### 2. Login Test
```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "TEACHER"
  }
}
```

---

## Frontend Integration

Once the backend is fixed, update the frontend login:

**File:** `src/app/login/page.tsx`

The frontend already uses the correct endpoint via the auth API:
```typescript
const response = await auth.login({ email, password });
```

Just ensure the API URL is correct in `.env.local`:
```
NEXT_PUBLIC_API_URL=https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1
```

---

## Temporary Workaround

Until the database is fixed, use signup to create new test accounts:

```bash
# Always include "role": "TEACHER"
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Teacher",
    "email": "new.teacher@example.com",
    "password": "password123",
    "phone": "+919876543210",
    "role": "TEACHER"
  }'
```

---

## Database Migration Script

For production deployment, run this migration:

```javascript
// migrate-roles.js
db.users.updateMany(
  { 
    role: { $in: [null, undefined] },
    email: { $exists: true }
  },
  { 
    $set: { role: "TEACHER" },
    $currentDate: { updatedAt: true }
  }
)

// Verify
db.users.find({ role: null }).count()
// Should return 0
```

---

**Last Updated:** 2026-03-30  
**Status:** ⚠️ Database fix required  
**Contact:** Backend Team
