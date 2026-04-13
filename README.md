<div align="center">

<br />

# 📚 Shiksha Sathi

**The modern educator's platform for Indian schools — NCERT-aligned question banks, smart assignments, and AI-powered auto-grading. Built for teachers. Trusted by classrooms.**

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-23-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/)
[![Backend on Cloud Run](https://img.shields.io/badge/Backend-Cloud%20Run-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![NCERT Exemplar](https://img.shields.io/badge/NCERT%20Exemplar-8,143-blueviolet?logo=google-scholar&logoColor=white)](https://ncert.nic.in/exemplar-problems.php)

<br />

</div>

---

## 🌟 Overview

**Shiksha Sathi** is a full-stack educational platform purpose-built for Indian teachers and students. It bridges the gap between curriculum standards (NCERT/CBSE/NEP 2020) and modern classroom tools — enabling teachers to browse curated question banks, create assignments in minutes, and receive AI-generated feedback — all at zero cost.

> *"Focus on teaching. Leave the paperwork to us."*

---

## ✨ Feature Highlights

| Category | Features |
|---|---|
| 📖 **Question Bank** | 8,787+ NCERT-aligned questions across Classes 6–12 (Canonical + Derived + Exemplar), browsable by Board → Class → Subject → Chapter |
| 📝 **Assignment Engine** | Create, share via link, and manage assignments with per-question point allocation |
| 🤖 **AI Auto-Grading** | NVIDIA-powered intelligent grading with per-answer feedback for students |
| 📊 **Analytics Dashboard** | Class-level and student-level performance tracking with visual reports |
| 🔐 **Secure Auth** | JWT-based authentication with Spring Security, role-based access (Teacher / Student / Admin) |
| 🏫 **Class Management** | Manage multiple classes, enroll students, and organize cohorts |
| 🔍 **Review Workflow** | 3-stage content pipeline: `PENDING → APPROVED → PUBLISHED` |
| 🧑‍💼 **Admin Panel** | Content review, derived question generation, and publish management |
| 📱 **Responsive UI** | Adaptive design with Framer Motion animations, dark-mode tokens, and mobile-first layout |
| 📦 **Content Versioning** | Full provenance tracking for every extracted question (source, version, chapter) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Shiksha Sathi                            │
│                                                                 │
│   ┌────────────────────────┐    ┌────────────────────────────┐  │
│   │   Next.js 16 Frontend  │    │  Spring Boot 3.4 Backend   │  │
│   │   (Vercel — Edge CDN)  │───▶│  (Google Cloud Run)        │  │
│   │                        │    │                             │  │
│   │  • React 19            │    │  • REST API (OpenAPI docs)  │  │
│   │  • Tailwind CSS 4      │    │  • JWT Auth (jjwt 0.12)    │  │
│   │  • Framer Motion       │    │  • Spring Security          │  │
│   │  • TypeScript 5        │    │  • Caffeine Cache           │  │
│   │  • NVIDIA AI client    │    │  • Actuator + Health checks │  │
│   └────────────┬───────────┘    └───────────────┬────────────┘  │
│                │                                │                │
│                └──────────────┬─────────────────┘                │
│                               │                                  │
│                    ┌──────────▼──────────┐                       │
│                    │   MongoDB Atlas      │                       │
│                    │  (Primary Database)  │                       │
│                    └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Module Structure (Hexagonal / Layered)

```
backend/
├── api/           # Spring Boot app — Controllers, DTOs, Services, Security
├── core/          # Domain models — pure Java entities (no framework deps)
└── infrastructure/# MongoDB repositories, external adapters
```

---

## 📁 Project Structure

```
Shiksha-Sathi/
│
├── 📂 backend/                         # Spring Boot REST API
│   ├── api/src/main/java/.../
│   │   ├── controller/                 # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── AssignmentController.java
│   │   │   ├── AssignmentSubmissionController.java
│   │   │   ├── QuestionController.java
│   │   │   ├── TeacherController.java
│   │   │   ├── ClassController.java
│   │   │   ├── AnalyticsController.java
│   │   │   ├── DerivedQuestionController.java
│   │   │   └── PublishController.java
│   │   ├── service/                    # AI grading, profile logic
│   │   ├── dto/                        # Request / Response objects
│   │   ├── config/                     # CORS, Cache, OpenAPI, AI config
│   │   └── security/                   # JWT filter, SecurityConfig
│   ├── core/                           # Domain entities
│   └── infrastructure/                 # Mongo repositories & adapters
│
├── 📂 src/                             # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── login/ & signup/            # Auth pages
│   │   ├── teacher/                    # Teacher portal
│   │   │   ├── dashboard/
│   │   │   ├── question-bank/
│   │   │   ├── assignments/
│   │   │   ├── classes/
│   │   │   └── profile/
│   │   ├── student/                    # Student portal
│   │   │   ├── dashboard/
│   │   │   ├── assignments/
│   │   │   ├── assignment/[id]/
│   │   │   └── results/
│   │   └── admin/                      # Admin review panel
│   ├── components/
│   │   ├── QuestionBankFilters.tsx
│   │   ├── StudentAssignmentForm.tsx
│   │   ├── CreateAssignmentForm.tsx
│   │   ├── AssignmentTray.tsx
│   │   ├── AdminDerivedReviewClient.tsx
│   │   └── ...
│   └── lib/api/                        # Typed API client
│
├── 📂 doc/NCERT/
│   ├── extractions/                    # Source question JSON files
│   └── registry.json                   # Chapter-level content registry
│
├── 📂 scripts/                         # Data pipeline utilities
│   ├── ingest-ncert-extraction.mjs     # Canonical question ingestion
│   ├── ingest-exemplar.mjs             # Exemplar question ingestion
│   ├── extract-exemplar-questions.py   # PDF text extraction via pdftotext
│   ├── parse-answer-pdfs.py            # NCERT answer PDF parsing
│   ├── scrape-shaalaa-exemplar.py      # Shaalaa.com URL discovery
│   ├── scrape-byjus-all.py             # BYJU'S solution scraping
│   ├── scrape-shaalaa-complete.py      # Full Shaalaa chapter scraping
│   ├── scrape-class9-10-urls.py        # Class 9-10 URL discovery
│   ├── fix-chemistry-shaalaa-urls.py   # Chemistry URL correction
│   ├── fix-mcq-options-with-shaalaa.py # MCQ option fix (text similarity)
│   ├── fix-mcq-by-position.py          # MCQ option fix (position-based)
│   ├── clean-mcq-inline-options.py     # Inline option extraction
│   ├── clean-answer-key-misclassifications.py  # Answer key cleanup
│   ├── clean-chemistry-mcqs.py         # Chemistry MCQ cleanup
│   ├── update-registry-titles.mjs      # Chapter title sync
│   ├── backfill-question-points.mjs    # Point recalculation
│   ├── review-exemplar-images.py       # Vision-based image review
│   └── reextract-exemplar-figures.py   # Figure re-extraction
│
├── Dockerfile                          # Frontend container
├── backend/Dockerfile                  # Backend container
├── .env.local.example                  # Environment template
└── vitest.config.ts                    # Frontend test runner (Vitest)
```

---

## 📊 Content Coverage

> **Live data** — sourced directly from the production MongoDB Atlas cluster.

Shiksha Sathi maintains two tiers of questions: **Canonical** (directly extracted from NCERT source PDFs, live & available to teachers) and **Derived** (AI-generated practice variants in Admin review pipeline).

### 📖 Canonical Questions — 668 Published & Live

| Class | Science | Maths | English | Physics | Biology | Total |
|-------|:-------:|:-----:|:-------:|:-------:|:-------:|:-----:|
| Class 6  | 38 | 38 | 20 | —  | —  | **96**  |
| Class 7  | 48 | 32 | 12 | —  | —  | **92**  |
| Class 8  | 52 | 28 | 12 | —  | —  | **92**  |
| Class 9  | 48 | 48 | —  | —  | —  | **96**  |
| Class 10 | 52 | 52 | —  | —  | —  | **104** |
| Class 11 | —  | 40 | —  | 28 | 40 | **108** |
| Class 12 | —  | 24 | —  | 32 | —  | **56**  |
| **Total** | | | | | | **🎯 644** |

> *Class 11 & 12 cover Biology, Physics, and Maths (Ch 1–10). Chemistry and remaining subjects are in the extraction queue.*

---

### 🧪 Derived (Practice) Questions — 343 Published

AI-generated variants, reviewed through the Admin pipeline and **published** — fully visible to teachers alongside canonical questions.

| Class | Derived Questions | Avg per Chapter |
|-------|:-----------------:|:---------------:|
| Class 6  | 50  | ~2.4 |
| Class 7  | 33  | ~2.2 |
| Class 8  | 38  | ~2.4 |
| Class 9  | 24  | ~2.0 |
| Class 10 | 28  | ~1.9 |
| Class 11 | 84  | ~3.1 |
| Class 12 | 84  | ~6.0 |
| **Total** | **343** | |

---

### 📝 NCERT Exemplar Questions — 8,143 Published

Exam-style questions sourced from **NCERT Exemplar Problems** textbooks — higher-difficulty practice questions for competitive exam preparation. All ingested as `PUBLISHED` and available to teachers.

| Class | Mathematics | Science | Biology | Chemistry | Physics | Total |
|-------|:-----------:|:-------:|:-------:|:---------:|:-------:|:-----:|
| Class 6  | 745 | 336 | —   | —   | —   | **1,081** |
| Class 7  | 1,571 | 353 | —   | —   | —   | **1,924** |
| Class 8  | 1,904 | 17 | —   | —   | —   | **1,921** |
| Class 9  | 100 | 280 | —   | —   | —   | **380** |
| Class 10 | 110 | 300 | —   | —   | —   | **410** |
| Class 11 | 168 | —   | 506 | 375 | 142 | **1,191** |
| Class 12 | 109 | —   | 420 | 1,214 | 1,114 | **2,857** |
| **Total** | **4,707** | **1,286** | **926** | **1,589** | **1,256** | **🎯 8,143** |

#### ✅ Answer Coverage

Every exemplar question includes answers and explanations:

| Question Type | With Answers | Total | Coverage |
|---|---|---|---|
| **MCQ** | 1,927 | 1,927 | **100%** |
| **FILL_IN_BLANKS** | 93 | 93 | **100%** |
| **TRUE_FALSE** | 5 | 5 | **100%** |
| **SHORT_ANSWER** | 5,810 | 5,810 | **100%** |
| **LONG_ANSWER** | 0 | 233 | DRAFT (hidden) |

> **Sources**: NCERT official answer PDFs (16 files), Shaalaa.com (270+ chapters), BYJU'S (216 chapters). All MCQs display proper options with correct answers highlighted.

> 75 exemplar questions requiring figure images are excluded from ingestion and will be added after image re-extraction is complete using `scripts/reextract-exemplar-figures.py`.

---

### 📈 Total Published: **9,131 Questions** across Classes 6–12

| Tier | Count | Description |
|------|------:|-------------|
| 🔵 Canonical | 644 | Direct NCERT textbook extraction |
| 🟢 Derived | 343 | AI-generated practice variants |
| 🟣 Exemplar | 8,143 | NCERT Exemplar Problems (exam-level, 100% answered) |
| **Grand Total** | **9,131** | |

> Contributions via the extraction workflow are welcome — see [Content Pipeline](#-content-pipeline).

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v18+ |
| Java (JDK) | v21+ (v23 recommended) |
| MongoDB | Atlas URI or local instance |
| Gradle | Bundled (`./gradlew`) |

---

### 1. Clone the Repository

```bash
git clone https://github.com/vikrantshome/Shiksha-Sathi.git
cd Shiksha-Sathi
```

---

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Required
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shikshasathi?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-jwt-secret

# Backend location (default for local dev)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Optional — NVIDIA AI Grading
GEMINI_API_KEY=your-gemini-api-key
```

---

### 3. Start the Backend (Spring Boot)

```bash
cd backend
./gradlew bootRun
```

The API will be available at **http://localhost:8080**

Swagger UI: **http://localhost:8080/swagger-ui.html**

---

### 4. Start the Frontend (Next.js)

```bash
# In a new terminal from project root
npm install
npm run dev:frontend
```

Frontend runs at **http://localhost:4000**

---

### 5. Run Both Concurrently

```bash
npm run dev
```

---

## 🔌 API Reference

> Full interactive documentation: **http://localhost:8080/swagger-ui.html**

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/signup` | Register a new teacher account |
| `POST` | `/api/v1/auth/login` | Authenticate and receive JWT |

### Question Bank

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/questions/boards` | List boards (`NCERT`) |
| `GET` | `/api/v1/questions/classes?board=NCERT` | Classes by board |
| `GET` | `/api/v1/questions/subjects` | All subjects |
| `GET` | `/api/v1/questions/books?board=NCERT&classLevel=6` | Books for a class |
| `GET` | `/api/v1/questions/chapters?subjectId=Science&book=Curiosity` | Chapters |
| `GET` | `/api/v1/questions/search?board=NCERT&classLevel=6` | Filter & search questions |

### Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/assignments` | Create assignment |
| `GET` | `/api/v1/assignments` | Teacher's assignment list |
| `GET` | `/api/v1/assignments/:id/report` | Submission report |
| `POST` | `/api/v1/assignments/:id/submit` | Student submission |

### Teacher & Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/PUT` | `/api/v1/teacher/profile` | Teacher profile |
| `GET/POST` | `/api/v1/classes` | Manage classes |
| `POST` | `/api/v1/classes/:id/students` | Add students to class |

### Admin & Publishing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/questions/publish-dashboard` | Review & publish stats |
| `POST` | `/api/v1/questions/publish` | Publish a chapter |
| `GET` | `/api/v1/derived` | Derived question review queue |

---

## 🧪 Testing

```bash
# Run all frontend unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test credentials (local/dev only):**
```
Teacher:  teacher@test.com  /  password123
Student:  student@test.com  /  password123
```

**Quick API smoke test:**
```bash
# Should return ["NCERT"]
curl http://localhost:8080/api/v1/questions/boards
```

---

## 📦 Content Pipeline

### Canonical Questions (NCERT Textbooks)

To add new NCERT questions to the database:

**Step 1 — Create extraction file** in `doc/NCERT/extractions/`:

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
  "questions": [
    {
      "text": "Find the coordinates of the point...",
      "type": "SHORT_ANSWER",
      "answer": "...",
      "explanation": "..."
    }
  ]
}
```

**Step 2 — Ingest into the database:**

```bash
node scripts/ingest-ncert-extraction.mjs doc/NCERT/extractions/class9-maths-ch3-v1.json
```

**Step 3 — Sync chapter registry titles:**

```bash
node scripts/update-registry-titles.mjs
```

---

### NCERT Exemplar Questions

Exemplar questions are extracted from NCERT PDFs, enriched with answers from multiple sources, and stored in `doc/Exemplar/` as per-chapter JSON files.

**Answer sources (multi-stage pipeline):**

1. **Solved Examples** — Extracted directly from exemplar PDFs (455 examples with step-by-step solutions)
2. **NCERT Answer PDFs** — 16 consolidated answer key PDFs parsed for MCQ/FILL_IN_BLANKS/TRUE_FALSE answers
3. **Shaalaa.com** — 270+ chapter pages scraped for properly formatted MCQs with options
4. **BYJU'S** — 216 chapter pages scraped for additional MCQ coverage

**Ingest all exemplar questions:**

```bash
# Dry run first
npm run ingest:exemplar:dry

# Actual ingestion
npm run ingest:exemplar -- --force

# Verify results
npm run ingest:exemplar:verify
```

**Filter by class or subject:**

```bash
npm run ingest:exemplar -- --class=7 --subject=science
```

**Fix MCQ options after ingestion:**

```bash
# Clean inline options from garbled PDF text
.venv/bin/python scripts/clean-mcq-inline-options.py

# Fix remaining MCQs using Shaalaa position-based matching
.venv/bin/python scripts/fix-mcq-by-position.py

# Clean Chemistry answer key misclassifications
.venv/bin/python scripts/clean-chemistry-mcqs.py
```

> 75 exemplar questions requiring figure images are excluded from ingestion. These will be added after image re-extraction is complete using `scripts/reextract-exemplar-figures.py`.

---

## ☁️ Deployment

### Frontend → Vercel

```bash
# Via Vercel CLI
vercel deploy --prod
```

Required Vercel environment variables:
- `NEXT_PUBLIC_API_URL` → Your Cloud Run backend URL
- `JWT_SECRET`

### Backend → Google Cloud Run

```bash
# Build and submit to Cloud Run
cd backend
./gradlew build

gcloud run deploy shiksha-sathi-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI=<uri>,JWT_SECRET=<secret>
```

### Docker (Self-hosted)

```bash
# Frontend
docker build -t shiksha-sathi-frontend .
docker run -p 3000:3000 --env-file .env.local shiksha-sathi-frontend

# Backend
cd backend
docker build -t shiksha-sathi-backend .
docker run -p 8080:8080 --env-file .env.local shiksha-sathi-backend
```

---

## 🔧 Environment Variables

### Frontend (`.env.local`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Spring Boot backend base URL |
| `JWT_SECRET` | ✅ | Must match backend secret |
| `GEMINI_API_KEY` | ⚠️ | Required for AI auto-grading |

### Backend (`.env` or Cloud Run env)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing key |
| `PORT` | ❌ | Server port (default: `8080`) |
| `AI_GRADING_ENABLED` | ❌ | Toggle NVIDIA grading (`true`/`false`) |

---

## 🔐 Security Notes

- All routes are protected via **Spring Security** + **JWT Bearer token**
- Passwords are **bcrypt-hashed** (never stored in plaintext)
- CORS is explicitly whitelisted to production Vercel domains
- Environment secrets are **never committed** — see `.gitignore`
- Input validation enforced at both DTO (Bean Validation) and service layers

---

## 🛣️ Roadmap

- [ ] **Expanded content** — Classes 7–10 full chapter coverage
- [ ] **Offline support** — PWA / service worker for low-bandwidth classrooms
- [ ] **Vernacular language support** — Hindi & regional language question sets
- [ ] **Parent dashboard** — Progress reports for guardians
- [ ] **WhatsApp assignment sharing** — India-first distribution channel
- [ ] **Adaptive difficulty** — AI-driven question recommendation engine

---

## 🤝 Contributing

We welcome contributions that improve content quality, platform stability, or teacher UX.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes with a meaningful message
4. Push and open a Pull Request against `main`

For content contributions, follow the [Content Pipeline](#-content-pipeline) guide.

---

## 📄 License

This project is licensed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">

**Built with ❤️ for Indian Education**

*Aligned with NCERT · CBSE · NEP 2020*

</div>
