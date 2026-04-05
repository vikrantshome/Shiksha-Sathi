# Shiksha Sathi — AI Engineering Context

## Project Overview

**Shiksha Sathi** is a comprehensive NCERT-aligned question bank platform for Indian teachers. It enables teachers to browse, create, and manage assignments using curriculum-aligned content across Classes 6–12.

### Architecture

| Layer | Technology | Location |
|-------|-----------|----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 | `src/` |
| **Backend** | Spring Boot 3.4.3, Java 23, Spring Security + JWT | `backend/` |
| **Database** | MongoDB Atlas (remote) / local for dev | `mongodb+srv://` |
| **Deployment** | Vercel (frontend), Cloud Run / local (backend) | — |

### Backend Module Structure

| Module | Purpose |
|--------|---------|
| `backend/api/` | REST controllers (Question, Assignment, Auth, Derived) |
| `backend/core/` | Domain models (`Question`, `User`, `Assignment`, etc.) |
| `backend/infrastructure/` | Repositories, security config, application entry |

### Frontend Structure

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js pages (login, signup, teacher, admin) |
| `src/components/` | React UI components |
| `src/lib/api/` | Typed API client (`fetchApi`) with auth cookie handling |
| `src/proxy.ts` | Middleware for route protection (`/teacher/*`) |

---

## Key Domain Concepts

### Question Model

Questions are the core entity. Each question has:

- **Source Kind**: `CANONICAL` (extracted from NCERT) or `DERIVED` (AI-generated practice variants)
- **Review Status**: `DRAFT` → `APPROVED` → `PUBLISHED` (teacher-facing visibility requires `PUBLISHED`)
- **Provenance**: `board`, `class`, `subject`, `book`, `chapterNumber`, `chapterTitle`, `sourceFile`
- **Types**: `MCQ`, `TRUE_FALSE`, `FILL_IN_BLANKS`, `SHORT_ANSWER`
- **Derived Linkage**: `sourceCanonicalQuestionIds[]`, `derivedFromChapterId`, `generationRunId`, `generationRationale`

### Derived Question Policy

Derived questions are AI-generated practice variants of canonical NCERT content. They must:

1. Change at least one of: application context, reasoning step, question type, difficulty
2. NOT be simple wording rewrites or synonym swaps
3. Stay within the approved chapter concept boundary
4. Link back to canonical source questions via `sourceCanonicalQuestionIds`
5. Use only allowed types: `MCQ`, `TRUE_FALSE`, `FILL_IN_BLANKS`, `SHORT_ANSWER`

### Content Pipeline

```
NCERT PDF → Extract (JSON) → Ingest (MongoDB) → Review → PUBLISH
                                         ↓
                                   Derived Generation → Review → PUBLISH
```

Scripts for this pipeline live in `scripts/`:
- `ingest-ncert-extraction.mjs` — ingest extracted chapter JSON
- `ingest-derived-batch-args.mjs` — ingest derived question JSON files
- `generate-coverage-ledger.mjs` — generate coverage report
- Various NCERT utility scripts (approve, backfill, update, etc.)

---

## Building & Running

### Prerequisites

- **Node.js** v18+ (frontend)
- **Java** v23 (backend — toolchain configured in `build.gradle`)
- **MongoDB** connection string (production Atlas cluster or local)

### Environment Setup

```bash
cp .env.local.example .env.local
# Edit .env.local with:
#   MONGODB_URI=mongodb+srv://...
#   JWT_SECRET=your-secret
#   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev:frontend` | Start Next.js dev server on port 4000 |
| `npm run dev:backend` | Start Spring Boot backend on port 8080 |
| `npm run dev` | Run both frontend and backend concurrently |
| `npm run build` | Production build (Next.js standalone output) |
| `npm start` | Start production Next.js server |
| `npm test` | Run Vitest test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `cd backend && ./gradlew bootRun` | Start backend directly |
| `cd backend && ./gradlew build` | Build backend JAR |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/questions/boards` | GET | Available boards |
| `/api/v1/questions/classes` | GET | Classes for a board |
| `/api/v1/questions/subjects` | GET | Subjects |
| `/api/v1/questions/books` | GET | Books for class/subject |
| `/api/v1/questions/chapters` | GET | Chapters for book |
| `/api/v1/questions/search` | GET | Search questions with filters |
| `/api/v1/derived-questions` | GET | List derived questions (filter by status, chapter) |
| `/api/v1/derived-questions/{id}/approve` | POST | Approve derived question |
| `/api/v1/derived-questions/{id}/reject` | POST | Reject derived question |
| `/api/v1/derived-questions/publish` | POST | Publish approved derived questions |
| `/api/v1/assignments/link/{linkId}` | GET | Public assignment by link |
| `/api/v1/submissions` | POST | Submit assignment answers |

Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## Security Configuration

Spring Security (`SecurityConfig.java`) allows:

- **Public**: `/api/v1/auth/*`, `/api/v1/assignments/link/**`, `/api/v1/submissions`
- **Public GET**: `/api/v1/questions/**`, `/api/v1/derived-questions/**` (read-only)
- **Public POST**: `/api/v1/derived-questions/**`, `/api/v1/questions/**` (admin management)
- **Authenticated**: All other endpoints (JWT required)

The frontend uses `auth-token` HTTP-only cookie for authentication. The Next.js middleware (`proxy.ts`) redirects unauthenticated users from `/teacher/*` to `/login`.

---

## Testing

- **Frontend**: Vitest + React Testing Library + jsdom
- **Backend**: JUnit 5 + Spring Boot Test + Testcontainers (MongoDB)
- **Config**: `vitest.config.ts`, `vitest.setup.ts`

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
cd backend && ./gradlew test  # Backend tests
```

---

## Jira Integration

- **Project Key**: `SSA`
- **Branch Convention**: `feature/SSA-<number>-<description>`
- **PR Template**: `.github/pull_request_template.md` (requires Jira issue link)

---

## Important Files

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies and scripts |
| `next.config.ts` | Next.js config (standalone output for deployment) |
| `backend/build.gradle` | Multi-module Gradle build (Java 23, Spring Boot 3.4.3) |
| `tsconfig.json` | TypeScript config (strict mode, Next.js paths) |
| `src/lib/api/client.ts` | Centralized `fetchApi` with auth cookie handling |
| `src/lib/api/derived.ts` | Derived question API client |
| `src/lib/api/questions.ts` | Question bank API client |
| `src/app/admin/page.tsx` | Admin dashboard for derived question review |
| `doc/NCERT/derived-question-workflow.md` | Derived question policy and workflow |
| `doc/NCERT/coverage-ledger.json` | Source of truth for NCERT chapter coverage |

---

## Known Patterns & Conventions

- **MongoDB field naming**: camelCase in code → snake_case in DB (e.g., `sourceKind` → `source_kind`)
- **Provenance inheritance**: Derived questions must inherit `provenance` from canonical sources
- **Error handling**: Admin dashboard uses `try/catch` + `.catch(() => [])` for graceful degradation when backend is unavailable
- **Stateless sessions**: JWT-based auth, no server-side sessions
- **Standalone output**: Next.js builds to `.next/standalone/` for containerized deployment

---

## Agent Operating rules

1. **Do not** generate low-quality derived questions (no synonym swaps, no wording-only rewrites)
2. **Do not** expose `DRAFT`, `APPROVED`, or `REJECTED` content to teacher-facing flows
3. **Do** maintain chapter boundary — derived questions must stay within approved chapter scope
4. **Do** link every derived question to its canonical source via `sourceCanonicalQuestionIds`
5. **Do** use `scripts/ingest-derived-batch-args.mjs` to ingest derived JSON files into MongoDB
6. **Always** verify build passes (`npm run build`) before considering a change complete
7. **Always** follow the PR template when creating pull requests (link Jira issue)
