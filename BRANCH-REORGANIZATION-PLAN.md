# 🌿 Branch Reorganization Plan - Shiksha Sathi

**Date:** 2026-03-31  
**Goal:** Clean up branches, create proper PRs, merge in correct order

---

## Current Status

### ✅ Completed Work (On Main)

1. **SSA-260: Responsive Spacing Refinement** ✅ COMPLETE
   - All 6 stories completed
   - Code merged to main
   - Documentation complete

2. **Material 3 Brand Refresh** ✅ COMPLETE
   - Commit: `c5097b1`
   - Branch: `feat/material-3-refresh-complete` (created)
   - Ready for PR

3. **Security Fixes** ✅ COMPLETE
   - All credentials removed from docs
   - Backend .gitignore added
   - GitGuardian false positive documented

---

## Branch Cleanup Plan

### Step 1: Delete Old Feature Branches

**Branches to delete (already merged):**
```bash
git branch -d feature/SSA-261-spacing-audit
git branch -d feature/SSA-263-teacher-spacing
git branch -d feature/SSA-264-workflow-spacing
git branch -d feature/SSA-265-student-spacing
git branch -d feature/SSA-266-responsive-closeout
```

**Remote cleanup:**
```bash
git push origin --delete feature/SSA-261-spacing-audit
git push origin --delete feature/SSA-263-teacher-spacing
git push origin --delete feature/SSA-264-workflow-spacing
git push origin --delete feature/SSA-265-student-spacing
git push origin --delete feature/SSA-266-responsive-closeout
```

### Step 2: Create Clean PR Branches

#### PR 1: Material 3 Refresh (Ready Now)

**Branch:** `feat/material-3-refresh-complete` (already created from `c5097b1`)

**Changes:**
- MD3 button hierarchy (btn-filled, btn-tonal, btn-outlined)
- Teacher sidebar narrowed: 256px → 224px
- MD3 inset pill-shaped nav selected state
- Auth shell brand alignment
- Radius compliance sweep (rounded-xl/2xl → rounded-lg)

**PR Title:**
```
feat(ui): Brand-aligned Material 3 refresh across shared shell and route clusters
```

**Action:**
```bash
git checkout feat/material-3-refresh-complete
git push -u origin feat/material-3-refresh-complete
# Create PR on GitHub
```

#### PR 2: Security & Backend Config (From Stash)

**Branch:** Create from main + stash
```bash
git checkout main
git checkout -b fix/security-and-backend-config
git stash pop  # Apply stash with security fixes
git commit -am "fix: Security improvements and backend config"
git push -u origin fix/security-and-backend-config
```

**Changes:**
- Backend .gitignore for .env files
- Security documentation
- CORS config updates
- MongoDB connection fixes

**PR Title:**
```
fix: Security improvements and backend configuration
```

---

## PR Merge Order

1. **PR 1: Material 3 Refresh** (`feat/material-3-refresh-complete`)
   - ✅ Ready now
   - Non-breaking UI improvements
   - No backend changes

2. **PR 2: Security & Backend Config** (`fix/security-and-backend-config`)
   - After PR 1 merged
   - Contains critical security fixes
   - Backend configuration updates

---

## Old Branch Cleanup

### Delete These Branches (Merged/Obsolete)

**SSA-260 Related (All Merged):**
```bash
git branch -d feature/SSA-261-spacing-audit
git branch -d feature/SSA-263-teacher-spacing
git branch -d feature/SSA-264-workflow-spacing
git branch -d feature/SSA-265-student-spacing
git branch -d feature/SSA-266-responsive-closeout
```

**Old Cutover Branches (If Merged):**
```bash
git branch -d cutover/ssa-122-profile-parity
git branch -d cutover/ssa-141-test-migration-and-actions-cleanup
```

**Old Auth Branches (If Superseded):**
```bash
git branch -d feature/SSA-11-teacher-auth
git branch -d feature/SSA-120-auth-cutover-parity
git branch -d feature/SSA-120-auth-parity-new
git branch -d feature/SSA-63-auth-coverage
```

**Remote Cleanup:**
```bash
git push origin --delete <branch-name>
```

---

## Jira Alignment

### Material 3 Refresh

**Epic:** SSA-249 (Design System) or new epic  
**Stories:**
- SSA-XXX: Shared MD3 tokens and components
- SSA-XXX: Teacher shell modernization
- SSA-XXX: Auth shell brand alignment
- SSA-XXX: Route cluster updates

### Security Fixes

**Epic:** Technical Debt / Security  
**Stories:**
- SSA-XXX: Credential exposure remediation
- SSA-XXX: Backend .gitignore and security docs
- SSA-XXX: MongoDB connection hardening

---

## Execution Checklist

- [ ] Create `feat/material-3-refresh-complete` branch ✅ DONE
- [ ] Push to origin
- [ ] Create PR on GitHub
- [ ] Link to Jira stories
- [ ] Request review
- [ ] Merge after approval
- [ ] Delete merged branches
- [ ] Apply security stash to new branch
- [ ] Create security PR
- [ ] Clean up old branches (local + remote)

---

## Timeline

**Today (2026-03-31):**
- [x] Organize branches
- [ ] Create Material 3 PR
- [ ] Create Security PR

**Tomorrow (2026-04-01):**
- [ ] Review and merge Material 3 PR
- [ ] Review and merge Security PR
- [ ] Clean up old branches

---

**Last Updated:** 2026-03-31  
**Status:** Branch organized, ready for PRs
