# AGENTS.md - Development Guidelines

## Project Overview
Shiksha Sathi is an educational platform with a Next.js frontend, Spring Boot backend (Java/Gradle), and Python scripts for data processing.

## Build Commands

### Frontend (Next.js/React/TypeScript)
```bash
npm run dev:frontend      # Start frontend dev server (port 4000)
npm run build             # Production build
npm run start             # Start production server
npm run lint              # Run ESLint
npm run test              # Run all tests (Vitest)
npm run test:watch        # Watch mode for tests
npm run test:coverage     # Tests with coverage report
```

### Running Single Tests
```bash
# Vitest (TypeScript/React tests)
npx vitest run src/dummy.test.ts                    # Single test file
npx vitest run -t "test name pattern"               # Match by name
npx vitest run tests/final-check.spec.ts            # E2E test

# Backend (Java/Gradle)
./backend/gradlew :api:test --tests ClassName       # Single test class
./backend/gradlew :core:test --tests ClassName      # Core module test
./backend/gradlew test --tests "*Pattern*"          # Pattern match

# Python scripts
source .venv/bin/activate
python scripts/verify_setup.py                      # Example script
```

### Backend (Spring Boot/Java/Gradle)
```bash
npm run dev:backend                 # Start backend dev server
cd backend && ./gradlew bootRun     # Alternative backend start
./backend/gradlew build             # Full backend build
./backend/gradlew test              # Run backend tests
./backend/gradlew :api:test         # API module tests only
./backend/gradlew :core:test        # Core module tests only
./backend/gradlew clean build       # Clean build
```

### Docker
```bash
docker-compose -f docker-compose.yml.local-optional up   # Local services
```

## Code Style Guidelines

### TypeScript/React (Frontend)

**Imports:**
- Absolute imports via `@/*` alias (e.g., `import Component from '@/components/Component'`)
- React 19 with `react-jsx` runtime
- Strict TypeScript mode enabled

**Naming Conventions:**
- Components: PascalCase (e.g., `QuizSession`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: match component name (e.g., `QuizSession.tsx`)

**Types:**
- Strict mode enabled in `tsconfig.json`
- Use TypeScript interfaces for props and domain types
- Avoid `any`; use `unknown` or proper types
- Module resolution: `bundler`

**Error Handling:**
- Use try-catch for async operations
- Leverage React error boundaries
- Return meaningful error messages to UI

**Formatting:**
- Follow ESLint config (`eslint.config.mjs`)
- Tailwind CSS v4 for styling
- framer-motion for animations

### Java (Backend)

**Project Structure:**
- Multi-module Gradle project (api, core, infrastructure)
- Spring Boot 3.4.3
- Java 23 toolchain
- Lombok for boilerplate reduction

**Naming Conventions:**
- Classes: PascalCase (e.g., `AssignmentSubmissionService`)
- Methods/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Test classes: `*Test.java` pattern

**Error Handling:**
- Use Spring's exception handling
- Custom exceptions for domain errors
- Proper test coverage with Testcontainers

**Testing:**
- JUnit 5 with Testcontainers for MongoDB
- Integration tests extend `AbstractIntegrationTest`
- Container: MongoDB 7.0.4

### Python (Scripts)

**Environment:**
- Python 3.14.3 virtual environment in `.venv/`
- Activate with: `source .venv/bin/activate`

**Scripts Location:** `/scripts/`

**Common Scripts:**
- `auto_enrich_exemplars.py` - Data enrichment
- `answer_extractor.py` - Answer extraction
- `audit-agent-nvidia.py` - Audit logging
- `clean-pua-chars.py` - Data cleaning
- `generate_report.py` - Report generation

**Style:**
- Follow PEP 8 conventions
- Type hints encouraged
- Use existing scripts as templates

## Testing Guidelines

### Frontend Tests (Vitest)
```typescript
import { describe, it, expect } from 'vitest'

describe('component', () => {
  it('should render correctly', () => {
    // Test implementation
  })
})
```

### Backend Tests (JUnit/Testcontainers)
```java
@SpringBootTest
@Testcontainers
class ServiceTest extends AbstractIntegrationTest {
    @Test
    void shouldReturnResult() {
        // Test implementation
    }
}
```

## File Structure
- `/src/` - Frontend source code (app, components, lib)
- `/backend/` - Spring Boot backend
- `/scripts/` - Python utility scripts
- `/tests/` - Frontend tests (Vitest + Playwright)
- `/doc/` - Documentation and data files

## Environment Variables
- `.env.local` - Local development
- `.env.production` - Production config
- `.env.vercel` - Vercel deployment
- Backend uses Spring's application properties

## Key Dependencies
- **Frontend:** Next.js 16.2.1, React 19.2.4, TypeScript 5, Vitest 4.1.1
- **Backend:** Spring Boot 3.4.3, Java 23, MongoDB, Testcontainers
- **Testing:** Vitest (frontend), JUnit 5 + Testcontainers (backend)

## Common Tasks

**Add new frontend component:**
1. Create in `/src/components/` with `.tsx` extension
2. Write test in `/tests/` or co-located `.test.tsx`
3. Run `npm run lint` and `npm run test`

**Add backend service:**
1. Create in appropriate module (`api`/`core`/`infrastructure`)
2. Extend `AbstractIntegrationTest` for tests
3. Run `./backend/gradlew :module:test`

**Run data script:**
1. Activate venv: `source .venv/bin/activate`
2. Run script: `python scripts/script-name.py`
3. Verify results in logs/database

## Notes
- Next.js version may differ from training data; check `node_modules/next/dist/docs/`
- MongoDB runs via Testcontainers for integration tests
- Backend uses Lombok; ensure IDE plugin is active
