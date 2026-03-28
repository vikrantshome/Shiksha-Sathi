# Shiksha Sathi - NCERT Question Bank

**A comprehensive question bank platform for Indian teachers with NCERT-aligned content.**

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (Frontend)
- **Java** v21+ (Backend - Spring Boot)
- **MongoDB URI** (Already configured in Vercel/Cloud Run)

### 1. MongoDB Setup

**✅ Already Configured!**

The MongoDB cluster URI is already set up in:
- **Vercel:** `MONGODB_URI` environment variable (Production)
- **Cloud Run:** Backend service configuration

**For local development, you have two options:**

**Option A: Use Production MongoDB (Recommended for testing)**
```bash
# Copy from Vercel
vercel env pull .env.local

# Select MONGODB_URI when prompted
```

**Option B: Create your own MongoDB Atlas cluster (for isolated dev)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster (M0 - Free tier)
3. Get connection string
4. Add to `.env.local`

### 2. Environment Setup

**Clone and configure:**

```bash
# Clone repository
git clone https://github.com/vikrantshome/Shiksha-Sathi.git
cd Shiksha-Sathi

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your MongoDB Atlas URI
nano .env.local
```

**.env.local should have:**
```bash
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/shikshasathi?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 3. Start Backend

```bash
cd backend
./gradlew bootRun
```

Backend runs on: **http://localhost:8080**

### 4. Start Frontend

```bash
# In a new terminal
npm run dev:frontend
```

Frontend runs on: **http://localhost:3000**

---

## 📊 Current Status

### Content Coverage

| Class | Science | Maths | English | Social Science | Total |
|-------|---------|-------|---------|----------------|-------|
| Class 6 | 28 (Ch1-7) | 28 (Ch1-7) | 16 (Ch1-4) | 16 (Ch1-4) | **84** |
| Class 7 | 8 (Ch1-2) | 8 (Ch1-2) | 4 (Ch1) | - | **20** |
| Class 8 | 8 (Ch1-2) | 8 (Ch1-2) | 4 (Ch1) | - | **20** |
| Class 9 | 4 (Ch1) | 4 (Ch1) | - | - | **8** |
| Class 10 | 4 (Ch1) | 4 (Ch1) | - | - | **8** |
| Class 11 | 36 (Ch1-10) | 36 (Ch1-10) | 36 (Ch1-10) | - | **108** |
| Class 12 | 36 (Ch1-10) | 36 (Ch1-10) | - | - | **72** |
| **Total** | | | | | **336** |

### Features

- ✅ NCERT-aligned question bank (336 questions)
- ✅ Teacher browse flow: Board → Class → Subject → Book → Chapter
- ✅ Question preview with answers & explanations
- ✅ Assignment creation & management
- ✅ Review workflow (PENDING → APPROVED → PUBLISHED)
- ✅ Extraction versioning & provenance tracking
- ✅ Derived question generation system
- ✅ Full API documentation

---

## 🧪 Testing

**See comprehensive testing guide:** [TESTING-INSTRUCTIONS.md](./TESTING-INSTRUCTIONS.md)

**Quick test:**
```bash
# Test backend API
curl http://localhost:8080/api/v1/questions/boards
# Expected: ["NCERT"]

# Test frontend
open http://localhost:3000/teacher/question-bank
```

**Test credentials:**
- Teacher: `teacher@test.com` / `password123`
- Student: `student@test.com` / `password123`

---

## 📁 Project Structure

```
Shiksha-Sathi/
├── backend/                 # Spring Boot backend
│   ├── api/                # REST API controllers
│   ├── core/               # Domain models
│   └── infrastructure/     # Repository & config
├── src/                    # Next.js frontend
│   ├── app/               # Pages
│   ├── components/        # React components
│   └── lib/api/          # API client
├── doc/NCERT/             # NCERT content & registry
│   ├── extractions/      # Extracted questions (JSON)
│   └── registry.json     # Source registry
├── scripts/               # Utility scripts
│   ├── ingest-ncert-extraction.mjs
│   └── update-registry-titles.mjs
├── .env.local.example     # Environment template
├── TESTING-INSTRUCTIONS.md
└── README.md
```

---

## 🔌 API Endpoints

### Question Bank APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/questions/boards` | GET | Get available boards |
| `/api/v1/questions/classes?board=NCERT` | GET | Get classes for board |
| `/api/v1/questions/subjects` | GET | Get all subjects |
| `/api/v1/questions/books?board=NCERT&classLevel=6` | GET | Get books for class |
| `/api/v1/questions/chapters?subjectId=Science&book=Curiosity` | GET | Get chapters |
| `/api/v1/questions/search?board=NCERT&classLevel=6` | GET | Search questions |
| `/api/v1/questions/publish-dashboard` | GET | Get publish stats |
| `/api/v1/questions/publish` | POST | Publish chapter |

**Full API docs:** Backend Swagger UI at http://localhost:8080/swagger-ui.html

---

## 📝 Content Extraction Workflow

### Extract New Questions

1. **Create extraction JSON** in `doc/NCERT/extractions/`:
   ```json
   {
     "provenance": {
       "board": "NCERT",
       "class": "9",
       "subject": "Mathematics",
       "book": "Mathematics",
       "chapterNumber": 3,
       "chapterTitle": "Coordinate Geometry",
       "sourceFile": "iemh103.pdf"
     },
     "questions": [...]
   }
   ```

2. **Ingest into database:**
   ```bash
   node scripts/ingest-ncert-extraction.mjs doc/NCERT/extractions/class9-maths-ch3-v1.json
   ```

3. **Update registry titles:**
   ```bash
   node scripts/update-registry-titles.mjs
   ```

---

## 🚀 Deployment

### Backend (Spring Boot)

```bash
# Build JAR
cd backend
./gradlew build

# Run JAR
java -jar api/build/libs/api-0.0.1-SNAPSHOT.jar
```

**Deploy to:**
- AWS Elastic Beanstalk
- Google Cloud Run
- Heroku
- DigitalOcean App Platform

### Frontend (Next.js)

```bash
# Build
npm run build

# Start production
npm start
```

**Deploy to:**
- Vercel (recommended)
- Netlify
- AWS Amplify

### MongoDB

- **Production:** MongoDB Atlas (M10+ cluster)
- **Connection:** Via connection string in environment variables

---

## 📋 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api/v1` |
| `PORT` | Backend port | `8080` |

---

## 🐛 Known Issues

### All Questions Show as PENDING

**Status:** By Design ✅

All 336 questions require review before publishing (SSA-210 workflow enforcement).

**To publish for testing:**
```javascript
// In MongoDB shell
db.questions.updateMany({}, { $set: { review_status: "APPROVED" } })
```

---

## 📞 Support

- **Jira Project:** SSA
- **Documentation:** [TESTING-INSTRUCTIONS.md](./TESTING-INSTRUCTIONS.md)
- **Code Review:** [CODE-REVIEW-FINDINGS-RESPONSE-FINAL.md](./CODE-REVIEW-FINDINGS-RESPONSE-FINAL.md)

---

## 📄 License

[Add your license here]

---

**Built with ❤️ for Indian Education**
