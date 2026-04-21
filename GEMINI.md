# Shiksha Sathi Project Overview

Shiksha Sathi is a modern, high-performance educational platform designed for Indian schools. It provides NCERT-aligned question banks, smart assignments, and AI-powered auto-grading.

## 🏗️ Architecture

The project follows a decoupled, multi-tier architecture:

- **Frontend:** Next.js 16 (App Router) with React 19 and Tailwind CSS 4. Deployed on Vercel.
- **Backend:** Multi-module Spring Boot 3.4.3 with Java 23. Deployed on Google Cloud Run.
  - `api`: REST controllers, Security (JWT), and DTOs.
  - `core`: Pure Java domain entities and business logic (framework-independent).
  - `infrastructure`: MongoDB repositories and external AI adapters (NVIDIA/Gemini).
- **Database:** MongoDB Atlas (Primary document store).
- **Data Pipeline:** Python 3.14 scripts for PDF extraction (NCERT/Exemplar) and Node.js for ingestion.

## 🚀 Building and Running

### Prerequisites
- Node.js v18+
- Java 23
- MongoDB Atlas or local instance
- Python 3.14 (for scripts)

### Development Commands (from root)
- `npm run dev`: Start both frontend and backend concurrently.
- `npm run dev:frontend`: Start Next.js frontend on port 4000.
- `npm run dev:backend`: Start Spring Boot backend on port 8080.
- `npm run lint`: Run ESLint checks.

### Testing
- `npm test`: Run frontend unit tests (Vitest).
- `npm run test:coverage`: Generate frontend test coverage reports.
- `./backend/gradlew test`: Run all backend tests (JUnit 5 + Testcontainers).

### Content Ingestion
- `npm run ingest:exemplar`: Ingest NCERT exemplar questions.
- `npm run ingest:exemplar:dry`: Dry-run for exemplar ingestion.

## 🛠️ Development Conventions

### Coding Style
- **Frontend:** PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants. Uses absolute imports via `@/*`.
- **Backend:** Hexagonal architecture boundaries. Uses Lombok for boilerplate reduction.
- **Python:** Virtual environment managed in `.venv/`.

### Testing Standards
- **Frontend:** Vitest + React Testing Library + Playwright for E2E.
- **Backend:** JUnit 5 with Testcontainers for MongoDB integration testing.

### Git & Documentation
- **No Staging:** Do not stage or commit changes unless explicitly requested.
- **Documentation:** Root `doc/` folder contains architectural decisions and project-specific guidelines. `AGENTS.md` and `QWEN.md` provide specialized instructions for AI assistants.

## 🔐 Security
- JWT-based authentication for teachers, students, and admins.
- NVIDIA/Gemini API keys for AI grading (managed via environment variables).
- History-purged: Leaked keys have been removed from Git history.
