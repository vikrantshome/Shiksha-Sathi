# AGENTS.md — Development Guidelines

Compact, repo-specific guidance. Excludes generic best practices; includes only what an agent would miss without explicit documentation.

## Quick Start
- **Frontend (port 4000):** `npm run dev:frontend`
- **Backend (port 8080):** `npm run dev:backend` or `cd backend && ./gradlew bootRun`
- **Both concurrently:** `npm run dev`

## Typecheck & Lint
- Frontend typecheck: `npx tsc --noEmit` (no dedicated script)
- Frontend lint: `npm run lint`
- Backend build: `cd backend && ./gradlew build`

## Environment & Secrets (What to Set and Where)

### Backend env loading order (automatic on `bootRun`)
System env > `.env.local` (repo root) > `backend/src/main/resources/.env` (dev only). Values are injected via `backend/api/build.gradle`'s `bootRun` task.

**Required variables:**
- `MONGODB_URI` — MongoDB Atlas connection string (no default).
- `JWT_SECRET` — JWT signing key. **Must override in production**; the placeholder default is insecure.
- `NVIDIA_API_KEY` — **Mandatory** for AI grading via Spring `ai-grading.api-key` property.

**Optional:**
- `AI_GRADING_ENABLED` (default: `true`)
- `AI_GRADING_PROVIDER` (default: `nvidia`)
- `PORT` (default: `8080`)

### Frontend
Expects `NEXT_PUBLIC_API_URL` and `JWT_SECRET` at build/runtime (from `.env.local`).

### Security notes
- **History purge completed (2026-04-19):** A hardcoded NVIDIA API key existed in commits `2061b21` through `2459b6b`. It has been revoked and purged from Git history via `git-filter-repo`. All branches rewritten. Local clones should be recloned or reset.
- `.env.local` is already in `.gitignore`. Keep it that way.

## Single Tests

### Frontend (Vitest + Testing Library)
- Run all: `npm test`
- Single file: `npx vitest run src/components/__tests__/QuestionCard.test.tsx`
- By test name: `npx vitest run -t "renders correctly"`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`

### Backend (Gradle + JUnit 5 + Testcontainers)
- All tests: `./backend/gradlew test`
- API module only: `./backend/gradlew :api:test`
- Core module only: `./backend/gradlew :core:test`
- Single class: `./backend/gradlew :api:test --tests "com.shikshasathi.backend.api.service.QuestionServiceTest"`
- Pattern match: `./backend/gradlew test --tests "*IntegrationTest"`

**Testcontainers:** Integration tests extend `AbstractIntegrationTest`, which auto-starts a MongoDB 7.0.4 container. Expect ~30s startup delay. No manual Docker needed.

## Architecture Boundaries
- **Frontend:** Next.js 16 App Router (`src/app/`), React 19, TypeScript 5, Tailwind CSS v4, absolute imports via `@/*`.
- **Backend:** Spring Boot 3.4.3, Java 23, Gradle multi-module:
  - `api` — Controllers, Services, DTOs, Security
  - `core` — Pure domain entities (no Spring dependencies)
  - `infrastructure` — Mongo repositories and adapters
- **Data pipeline:** Python 3.14 scripts in `scripts/` using virtualenv `.venv/`.

## Critical Runtime Quirks (Non-Obvious Behavior)

1. **Phone login returns candidate profiles** (`AuthService.authenticate`)
   - When multiple active students share a phone, response includes `candidateProfiles` array and `token=null`. Frontend must show a picker UI; only after selection is a token issued per user.

2. **Assignment lookup order** (`AssignmentService.getAssignmentByLinkId`)
   - `GET /assignments/link/{linkId}` tries:
     1. Prefix match against `id` (first 8 characters)
     2. Full ID match
     3. Short alphanumeric `code` match
   - Collision risk if multiple IDs share the same 8-char prefix. Prefer full ID or code in production links.

3. **Question search dual strategy** (`QuestionService.searchQuestions`)
   - If `chapter` param is provided, matches exact `chapter` field.
   - Otherwise, matches on `provenance.chapterNumber` + `provenance.chapterTitle`.
   - Both paths can be combined via `$or`. Tests verify this behavior.

4. **LocalStorage persistence**
   - Assignment selection: `shiksha-sathi-assignment-questions`
   - Quiz selection: `shiksha-sathi-quiz-questions`
   - Contexts hydrate on mount and auto-save. Clearing storage resets in-progress work.

5. **Caffeine cache** (`CacheConfig`)
   - AI grading responses cached with 24 h TTL, max 10,000 entries. Cache is in-memory and cleared on restart.

6. **Public (unauthenticated) endpoints** (`SecurityConfig`)
   - `GET /api/v1/questions/**` and `GET /api/v1/derived-questions/**` (public read)
   - `GET /api/v1/assignments/**`, `POST /api/v1/submissions` (student assignment flow)
   - `GET /api/v1/classes/student/*/attendance`
   - `GET /api/v1/schools/**`
   - `POST /api/v1/derived-questions/**` and `POST /api/v1/questions/**` (admin review — currently open; consider securing in production)
   - `OPTIONS /**`

7. **JWT defaults**
   - `JwtUtil` uses a placeholder default secret. Override `JWT_SECRET` in production; otherwise tokens are trivially forgeable.

## Style & Conventions
- Frontend: PascalCase components, camelCase functions/vars, UPPER_SNAKE_CASE constants. Absolute imports via `@/*`.
- Backend: Lombok annotations (`@Getter/@Setter/@RequiredArgsConstructor`). IDE plugin required for navigation. Test classes named `*Test.java`.
- Mapping between frontend `types.ts` and backend DTOs is manual — keep field names and types aligned.

## Python Data Pipeline
- Activate venv: `source .venv/bin/activate`
- Many scripts modify the database. Always run with `--dry-run` first (if supported), verify output, then re-run with `--force` when appropriate.
- Key scripts:
  - `auto_enrich_exemplars.py` — data enrichment
  - `answer_extractor.py` — answer extraction
  - `audit-agent-nvidia.py` — audit logging
  - `clean-pua-chars.py` — data cleaning
  - `generate_report.py` — reporting

## Build & Deploy Notes
- Frontend: `output: 'standalone'` in `next.config.ts` → Docker-friendly.
- Backend: `./gradlew build` creates a bootable JAR. `bootRun` loads env files as noted above.
- Dockerfiles present for both services. Vercel/Cloud Run deployment documented in README.

## Gotchas
- **History purge completed** — The leaked NVIDIA key was present in commits from `2061b21` to `2459b6b`. All history rewritten on 2026-04-19; remote `main` and all branches are now clean. Local clones may still contain the key in object store — reclone or run `git filter-repo` locally if needed.
- **Assignment `linkId` prefix matching** can yield false positives if IDs share prefix; use full IDs or codes for sharing.
- **CORS** — only `localhost:*`, `127.0.0.1:*`, and `*.vercel.app` are whitelisted.
- **Lombok** — ensure IDE plugin is active; otherwise code will not compile.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
