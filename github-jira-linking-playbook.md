# GitHub + Jira Linking Playbook for Shiksha Sathi

## Goal

Use the GitHub repository for Shiksha Sathi as the engineering source of truth and link all branches, commits, and pull requests back to Jira project `SSA`.

This ensures:

- Jira issues show linked development activity
- PRs can be traced back to the correct issue
- Engineering work stays aligned with the existing Sprint 1 / 2 / 3 plan

## Current State

- Jira project already exists: `SSA` / `Shiksha Sathi`
- GitHub repository to use: `https://github.com/vikrantshome/Shiksha-Sathi.git`
- The repository currently appears to be empty, which is a good time to apply clean conventions
- The current URL is under a personal GitHub account. For team continuity, an organization-owned repo is preferable if you have one available

## One-Time Admin Setup

These steps require admin access and must be done once.

### 1. Connect GitHub to Jira

Install and configure the official `GitHub for Atlassian` app.

Required access:

- Jira site administrator
- GitHub organization owner

Recommendation:

- If possible, host this repo under a GitHub organization you control rather than only under a personal account

Outcome:

- Jira can display linked branches, commits, and pull requests on issue cards and issue detail pages

Official Atlassian docs:

- Connect GitHub Cloud to Jira:
  - https://support.atlassian.com/jira-cloud-administration/docs/integrate-with-github/
- Link GitHub development information to Jira work items:
  - https://support.atlassian.com/jira-cloud-administration/docs/use-the-github-for-jira-app/

### 2. Enable Smart Commits (Optional but Recommended)

Enable Smart Commits in Jira if you want commit messages to:

- add comments on issues
- log time
- transition issues

Official docs:

- Enable Smart Commits:
  - https://support.atlassian.com/jira-cloud-administration/docs/enable-smart-commits/
- Process work items with Smart Commits:
  - https://support.atlassian.com/jira-software-cloud/docs/process-issues-with-smart-commits/

### 3. Protect the Default Branch

Recommended GitHub branch protection for `main`:

- Require pull request before merge
- Require at least 1 approval
- Require status checks before merge
- Restrict direct pushes

## Required Naming Conventions

The Jira issue key must appear in the development workflow for Jira to link the work correctly.

### Branch Names

Use one of these formats:

- `feature/SSA-11-teacher-auth`
- `feature/SSA-12-class-management`
- `bugfix/SSA-27-student-identity-form`
- `chore/SSA-32-release-config`

### Commit Messages

Use the issue key in every commit message:

- `SSA-11 add teacher auth shell and login page`
- `SSA-12 create class list and add class form`
- `SSA-24 implement question search and preview drawer`

### Pull Request Titles

Use the issue key in the PR title:

- `SSA-11 Build teacher auth shell`
- `SSA-12 Add teacher class management flow`
- `SSA-24 Implement question search, filter, and preview`

## Recommended Daily Workflow

1. Pick the Jira issue to work on.
2. Move the Jira issue to the appropriate in-progress state.
3. Create a branch using the Jira issue key.
4. Commit with the Jira issue key in the commit message.
5. Open a PR with the Jira issue key in the title.
6. Reference the Jira issue in the PR description.
7. Merge only after review and checks pass.
8. Transition the Jira issue after merge.

## PR Description Template

Use this structure for every PR:

```md
## Jira
- Issue: SSA-XX

## What Changed
- Short summary of the implementation

## Why
- Why this change is needed for the MVP

## Validation
- Tests run
- Manual checks performed

## Notes
- Assumptions
- Follow-ups
```

## Recommended Repo Structure for Workflow Hygiene

Once the repo is initialized locally, add:

- `.github/pull_request_template.md`
- `CONTRIBUTING.md`
- `README.md`
- optional issue templates if you want GitHub-native triage too

## Suggested Mapping Between Jira and GitHub

### Sprint 1

- `SSA-11` auth flow
- `SSA-12` class management
- `SSA-13` question bank browsing
- `SSA-20` session persistence / protected routes
- `SSA-23` question bank seed scope
- `SSA-24` search / filter / preview

### Branch Examples

- `feature/SSA-11-teacher-auth`
- `feature/SSA-20-session-persistence`
- `feature/SSA-12-class-crud`
- `feature/SSA-24-question-search-preview`

## Smart Commit Examples

If Smart Commits are enabled, these become possible:

- `SSA-11 #comment auth scaffold pushed`
- `SSA-12 #time 2h #comment completed class create form`
- `SSA-24 #transition In Review`

Only use this after confirming the exact Jira workflow statuses.

## Best-Practice Rules for This Project

- One PR should usually map to one primary Jira issue
- Large issues may use a short-lived stack of PRs, but each PR title should still include the issue key
- Never open a PR without the Jira key in the title
- Prefer small, reviewable PRs over multi-issue PRs
- If a PR covers multiple issues, mention the main issue in the title and list supporting issues in the description

## Practical Rollout Plan

### Phase 1

- Initialize the Shiksha Sathi app repo locally
- Add Git remote pointing to `vikrantshome/Shiksha-Sathi.git`
- Add PR template and contribution rules

### Phase 2

- Connect GitHub to Jira using the official Atlassian integration
- Verify that a test branch and test PR with `SSA-11` appears on the Jira issue

### Phase 3

- Start implementation against Sprint 1 using the naming rules above

## What Codex Can Do Next

I can do the repo-side setup next:

- initialize a local git repo in the Shiksha Sathi folder
- add the GitHub remote
- create `.github/pull_request_template.md`
- create `CONTRIBUTING.md`
- create a starter `README.md`
- prepare the repo so PRs map cleanly to `SSA-*` issues

What I cannot do directly from this session is install the GitHub-for-Atlassian app on your GitHub/Jira admin side unless that admin surface is exposed here later.
