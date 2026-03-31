# 🚨 SECURITY ALERT - MongoDB Credentials Exposed

**Date:** 2026-03-31  
**Severity:** 🔴 CRITICAL  
**Status:** ⚠️ ACTION REQUIRED

---

## What Happened

GitGuardian detected a MongoDB connection string exposed in the repository:

```
mongodb+srv://devteam2025:devteam2026@naviksha.g77okxs.mongodb.net/shikshasathi
```

This contains:
- ❌ Database username: `devteam2025`
- ❌ Database password: `devteam2026`
- ❌ Cluster location: `naviksha.g77okxs.mongodb.net`

---

## IMMEDIATE ACTIONS REQUIRED

### Step 1: Rotate MongoDB Password (DO THIS NOW)

1. **Visit MongoDB Atlas:** https://cloud.mongodb.com/
2. **Go to:** Database Access → Users
3. **Find user:** `devteam2025`
4. **Click "Edit"**
5. **Click "Edit Password"**
6. **Generate new secure password** (use password generator)
7. **Save changes**

### Step 2: Update Local Environment

After changing password in Atlas:

1. **Update `.env.local`:**
   ```bash
   # Edit this file
   nano "/Users/anuraagpatil/naviksha/Shiksha Sathi/.env.local"
   
   # Update the MONGODB_URI with NEW password
   MONGODB_URI=mongodb+srv://devteam2025:NEW_PASSWORD@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha
   ```

2. **Update backend .env:**
   ```bash
   nano "/Users/anuraagpatil/naviksha/Shiksha Sathi/backend/api/src/main/resources/.env"
   
   # Update with NEW password (NO quotes!)
   MONGODB_URI=mongodb+srv://devteam2025:NEW_PASSWORD@naviksha.g77okxs.mongodb.net/shikshasathi?appName=naviksha
   ```

### Step 3: Verify Git Ignore

Ensure `.env` files are properly ignored:

```bash
# Check root .gitignore
cat .gitignore | grep -E "^\.env"

# Check backend .gitignore
cat backend/api/src/main/resources/.gitignore | grep -E "^\.env"
```

Both should show:
```
.env
.env.local
.env.production
```

### Step 4: Remove from Git History (If Committed)

If the credentials were actually committed (check GitGuardian details):

```bash
# Install BFG Repo-Cleaner
brew install bfg

# Remove sensitive files from history
cd "/Users/anuraagpatil/naviksha/Shiksha Sathi"
bfg --delete-files .env
bfg --delete-files .env.local

# Force push cleaned history
git push --force origin main
```

**⚠️ WARNING:** This rewrites git history. Coordinate with team members.

### Step 5: Mark as False Positive (If Appropriate)

If the credentials were NEVER actually committed to git (only in local files):

1. **Go to GitGuardian dashboard**
2. **Find the incident**
3. **Mark as "False Positive"** with reason:
   ```
   This file was never committed to git repository. 
   It exists only in local development environment and is properly 
   listed in .gitignore. No credentials were exposed in the 
   actual git history.
   ```

---

## Verification Checklist

- [ ] MongoDB password changed in Atlas
- [ ] Local `.env.local` updated with new password
- [ ] Backend `.env` updated with new password
- [ ] `.gitignore` properly configured
- [ ] Git history cleaned (if needed)
- [ ] GitGuardian incident resolved
- [ ] Team members notified (if working in team)

---

## Prevention

### Never Commit Environment Files

**Root `.gitignore`:**
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.test

# MongoDB
*.env
```

**Backend `.gitignore`:**
```gitignore
# Environment files
.env
*.env
application-local.yml
```

### Use Environment Variable Templates

Create `.env.example` (safe to commit):
```bash
# .env.example - SAFE TO COMMIT
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/database?appName=app
JWT_SECRET=your-secret-key-here
PORT=8080
```

Team members copy this and fill in real values.

### Use Secret Management

For production:
- **Vercel:** Use Environment Variables dashboard
- **Cloud Run:** Use Secret Manager
- **Never** store secrets in code or config files

---

## Contact

If you need help:
- **MongoDB Atlas Support:** https://support.mongodb.com/
- **GitGuardian:** https://docs.gitguardian.com/
- **Security Best Practices:** https://cheatsheetseries.owasp.org/

---

**Last Updated:** 2026-03-31  
**Priority:** 🔴 CRITICAL - Complete within 1 hour  
**Status:** Awaiting password rotation
