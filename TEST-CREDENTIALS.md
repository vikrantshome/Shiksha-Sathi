# Shiksha Sathi Test Credentials

**Last Updated:** 2026-03-30  
**Backend API:** https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1

---

## 🔑 Test Accounts

### Teacher Accounts

| Email | Password | Name | Purpose |
|-------|----------|------|---------|
| `teacher@test.com` | `password123` | Test Teacher | API Testing |
| `testapi@test.com` | `password123` | Test API User | API Testing |
| `qa_teacher_1@example.com` | `password123` | QA Teacher 1 | QA Testing |

**Note:** If these accounts don't exist, use the signup endpoint below to create them.

---

## 📝 API Testing Commands

### 1. Teacher Signup (Create Test Account)

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

**Expected Response (200):**
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

**If account already exists (409):**
```json
{
  "error": "Email already exists"
}
```

---

### 2. Teacher Login

```bash
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qa_teacher_1@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
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

**If credentials invalid (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Get Teacher Profile (Authenticated)

```bash
# First login to get token, then:
curl -X GET https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

### 4. Update Teacher Profile

```bash
curl -X PUT https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "school": "Test School",
    "board": "CBSE"
  }'
```

---

## 🧪 Question Bank API (Public - No Auth Required)

### Get Boards
```bash
curl -s https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/boards | python3 -m json.tool
# Expected: ["NCERT", "CBSE", "ICSE", "State Board"]
```

### Get Classes
```bash
curl -s "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/classes?board=NCERT" | python3 -m json.tool
# Expected: ["6","7","8","9","10","11","12"]
```

### Get Subjects
```bash
curl -s https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/subjects | python3 -m json.tool
# Expected: ["Biology","English","Mathematics","Physics","Science","Social Science"]
```

### Search Questions
```bash
curl -s "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/search?board=NCERT&classLevel=6&visibleOnly=true" | python3 -m json.tool
# Expected: JSON array of published questions
```

---

## 🔧 Troubleshooting

### "Invalid credentials" Error

**Possible causes:**
1. Account doesn't exist yet → Use signup endpoint first
2. Wrong password → Ensure it's exactly `password123`
3. Wrong email → Check for typos (e.g., `teacher@test.com` not `qa_teacher_1@example.com`)

**Solution:**
```bash
# Step 1: Try signup (will return 409 if exists)
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA Teacher",
    "email": "qa_teacher_1@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'

# Step 2: Then login
curl -X POST https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/teachers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qa_teacher_1@example.com",
    "password": "password123"
  }'
```

---

### 401 Unauthorized Error

**Cause:** Missing or invalid JWT token

**Solution:**
1. Login to get fresh token
2. Include `Authorization: Bearer <token>` header
3. Ensure no extra spaces in token

---

### 409 Conflict Error

**Cause:** Email already registered

**Solution:** Use a different email or login with existing credentials

---

## 🌐 Frontend Testing

### Local Development

```bash
# Start frontend
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
npm run dev

# Open browser
# http://localhost:3000
```

### Test User Flow

1. **Landing Page:** http://localhost:3000
2. **Teacher Login:** http://localhost:3000/login
   - Email: `qa_teacher_1@example.com`
   - Password: `password123`
3. **Dashboard:** http://localhost:3000/teacher/dashboard
4. **Classes:** http://localhost:3000/teacher/classes
5. **Question Bank:** http://localhost:3000/teacher/question-bank

---

## 📊 Database Connection

**MongoDB URI:** (See `.env.local` - restricted access)

**Direct Connection:**
- Host: naviksha.g77okxs.mongodb.net
- Database: shikshasathi
- Authentication: Required (contact devteam)

---

## 📞 Support

For access issues or to reset test accounts, contact:
- Development Team: devteam2026
- Project: Shiksha Sathi

---

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- These are TEST accounts only
- Do NOT use in production
- Do NOT store real user data
- Reset passwords after testing if needed
- Keep `.env.local` file secure and never commit
