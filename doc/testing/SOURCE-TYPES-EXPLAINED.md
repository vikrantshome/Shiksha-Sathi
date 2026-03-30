# 📝 Question Source Types Explained

**Date:** 2026-03-30  
**Status:** ✅ DOCUMENTED

---

## What Does "SOURCE: LOCAL" Mean?

When you see **"SOURCE: LOCAL"** in the assignment creation UI, it indicates the **source type** of the question.

---

## Source Types

### 1. CANONICAL ✅
- **Meaning:** Official NCERT questions imported from textbooks
- **Count:** 1,136 questions
- **Source:** NCERT curriculum (SSA-248 ingestion)
- **Example:** Questions from NCERT Science Class 10, Chapter 1

### 2. DERIVED ⚠️
- **Meaning:** Questions adapted/modified from canonical sources
- **Count:** 0 questions (currently)
- **Source:** Modified NCERT questions

### 3. LOCAL ⚠️
- **Meaning:** Manually created questions by teachers/users
- **Count:** 17 questions (test data)
- **Source:** Custom creation

---

## Database Status (Verified)

```
Total Questions: 1,153
├── CANONICAL: 1,136 questions ✅
├── LOCAL: 0 questions
└── No sourceKind: 17 questions (test data)
```

---

## If You See "SOURCE: LOCAL" for NCERT Questions

### Possible Causes

1. **Browser Cache** — The page is showing old cached data
2. **Frontend Not Refreshed** — Need to hard refresh the page
3. **Wrong Questions Displayed** — You might be viewing the 17 test questions

### Solutions

**Option 1: Hard Refresh Browser**
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

**Option 2: Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Option 3: Re-select Filters**
1. Deselect all filters in question bank
2. Re-select: Board (NCERT), Class (e.g., 10), Subject (Science)
3. Questions should now show "SOURCE: CANONICAL"

---

## How to Verify

### API Test
```bash
# Test Class 10 Science questions
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/search?board=NCERT&classLevel=10&subjectId=Science&visibleOnly=true" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'Total: {len(data)}'); print(f'CANONICAL: {len([q for q in data if q.get(\"sourceKind\") == \"CANONICAL\"])}'); print(f'LOCAL: {len([q for q in data if q.get(\"sourceKind\") == \"LOCAL\"])}')"
```

**Expected Output:**
```
Total: 232
CANONICAL: 232
LOCAL: 0
```

### Database Check
```javascript
// MongoDB query
db.questions.countDocuments({ sourceKind: "CANONICAL" })
// Expected: 1136

db.questions.countDocuments({ sourceKind: "LOCAL" })
// Expected: 0 or 17 (test data)
```

---

## UI Display Logic

From `QuestionCard.tsx` (line 72):

```typescript
SOURCE: {q.sourceKind || "LOCAL"}
```

**Explanation:**
- If `sourceKind` exists → Display it (e.g., "CANONICAL")
- If `sourceKind` is null/undefined → Display "LOCAL" (fallback)

---

## Question Distribution

### By Class (All CANONICAL)

| Class | Questions | Source |
|-------|-----------|--------|
| 6 | 124 | CANONICAL ✅ |
| 7 | 184 | CANONICAL ✅ |
| 8 | 152 | CANONICAL ✅ |
| 9 | 244 | CANONICAL ✅ |
| 10 | 232 | CANONICAL ✅ |
| 11 | 120 | CANONICAL ✅ |
| 12 | 80 | CANONICAL ✅ |

### By Subject (All CANONICAL)

| Subject | Questions | Source |
|---------|-----------|--------|
| Science | 590 | CANONICAL ✅ |
| Mathematics | 354 | CANONICAL ✅ |
| Physics | 80 | CANONICAL ✅ |
| English | 48 | CANONICAL ✅ |
| Biology | 40 | CANONICAL ✅ |
| Social Science | 24 | CANONICAL ✅ |

---

## Testing Checklist

When testing assignment creation:

- [ ] Select NCERT board
- [ ] Select Class 10
- [ ] Select Science subject
- [ ] Select Chapter 1: Chemical Reactions
- [ ] Verify questions show "SOURCE: CANONICAL"
- [ ] If shows "LOCAL", hard refresh browser (Cmd+Shift+R)

---

## Related Documentation

- [Question Bank Verified](testing/QUESTION-BANK-VERIFIED.md) — Complete data verification
- [Testing Instructions](testing/TESTING-INSTRUCTIONS.md) — Manual testing guide
- [Test Credentials](testing/TEST-CREDENTIALS.md) — Test accounts

---

**Last Updated:** 2026-03-30  
**Status:** ✅ All 1,136 NCERT questions marked as CANONICAL  
**Known Issue:** 17 test questions without sourceKind (not affecting production)
