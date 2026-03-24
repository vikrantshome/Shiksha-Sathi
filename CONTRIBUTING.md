# Contributing

## Branch Naming

Use the Jira issue key in the branch name.

Recommended formats:

- `feature/SSA-11-teacher-auth`
- `feature/SSA-12-class-management`
- `feature/SSA-24-question-search-preview`
- `bugfix/SSA-XX-short-description`
- `chore/SSA-XX-short-description`

## Commit Messages

Every commit should include the Jira key.

Examples:

- `SSA-11 add login page scaffold`
- `SSA-20 persist teacher session in app shell`
- `SSA-24 add question preview drawer`

## Pull Requests

Every PR should:

- include the Jira key in the title
- describe the scope clearly
- list validation performed
- avoid mixing unrelated issues when possible

Recommended PR title format:

- `SSA-11 Build teacher auth shell`

## PR Scope

Prefer one primary Jira issue per PR.

If a PR touches more than one issue:

- keep one primary issue in the title
- mention supporting issues in the PR description

## Review Standard

Before opening a PR:

- run relevant tests if available
- manually validate the changed flow
- make sure no unrelated files were changed

## Jira Discipline

When starting work:

- move the issue to in-progress if your workflow supports it

When opening a PR:

- reference the Jira issue in the PR description

When merging:

- update the Jira issue status appropriately
