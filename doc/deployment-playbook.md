# Shiksha Sathi - Deployment & Release Playbook

This document establishes the minimum deployment and configuration baseline needed to ship the Shiksha Sathi MVP safely, satisfying the acceptance criteria for Jira SSA-32.

## 1. Environments & Environment Variables

### Environments
- **Preview (Staging):** Automatically created by Vercel for every Pull Request against the `main` branch. Used for QA and UAT testing.
- **Production (Live):** Automatically triggered on pushes/merges to the `main` branch.

### Required Environment Variables
The following environment variables must be defined in the respective deployment environments (Vercel) and local `.env.local` for development:
- `MONGODB_URI`: Connection string to the MongoDB Atlas cluster.
- `JWT_SECRET`: 512-bit secure key (HS512) for signing authentication tokens.
- `NEXT_PUBLIC_APP_URL`: The base URL of the frontend (e.g., `https://shikshasathi.vercel.app` or `http://localhost:3000`).

## 2. Secrets & Configuration Ownership
- **Infrastructure Owner:** Anuraag Patil (anuraagpatil123@gmail.com)
- **Database (MongoDB Atlas):** Managed via the primary Atlas account. Connection strings are generated per environment (dev, prod) using least-privilege database user credentials.
- **Hosting (Vercel):** Connected to the project's GitHub repository. Environment variables are managed securely via the Vercel Dashboard Settings -> Environment Variables.

## 3. Deployment Path
1. **Feature Development:** Developers work on `feature/{jira-key}-{name}` branches.
2. **Pull Request (Preview):** A PR is raised to `main`. Vercel creates an isolated Preview Deployment with its own URL. QA (SSA-34) validates this environment.
3. **Merge & Release (Production):** Once the PR is merged, Vercel initiates a Production Deployment. Commits to `main` should only occur for thoroughly tested, signed-off features.

## 4. Release Controls & Rollback Expectations
- **Release Controls:** Merges to `main` require a successful Vercel Preview build and passing linting (`npm run lint`).
- **Rollback:** In the event of a critical issue in Production, the team will use Vercel's one-click "Instantly Rollback" feature from the Deployment Dashboard to revert to the last known-good compilation, taking effect globally within seconds. Database rollbacks (if schemas are destructively changed, adhering to our non-destructive policy) require manual Atlas snapshot restoration.
