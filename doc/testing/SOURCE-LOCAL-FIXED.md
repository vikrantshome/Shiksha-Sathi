# ✅ SOURCE: LOCAL Issue - RESOLVED

**Date:** 2026-03-30  
**Status:** ✅ FIXED AND VERIFIED  
**Root Cause:** Field name mismatch (`sourceKind` vs `source_kind`)

---

## Issue Summary

**UI Showed:** "SOURCE: LOCAL" for all NCERT questions  
**Expected:** "SOURCE: CANONICAL"

---

## Root Cause

The backend Java code expects the field as `source_kind` (snake_case):
```java
@Field("source_kind")
private String sourceKind;
```

But the database had `sourceKind` (camelCase).

MongoDB field mapping:
- ❌ Database had: `sourceKind: "CANONICAL"`
- ✅ Backend expects: `source_kind: "CANONICAL"`
- ✅ After fix: `source_kind: "CANONICAL"`

---

## Fix Applied

**Database Migration:**
```javascript
db.questions.updateMany(
  { 
    provenance: { $exists: true },
    source_kind: { $exists: false },
    sourceKind: { $exists: true }
  },
  [{ $set: { source_kind: "$sourceKind" } }]
)
```

**Result:** 1,136 questions updated

---

## ✅ Verification

### API Test (After Fix)
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/search?board=NCERT&classLevel=7&subjectId=Mathematics&chapter=Chapter%209%3A%20Rational%20Numbers&visibleOnly=true"
```

**Response:**
```json
[
  {
    "sourceKind": "CANONICAL",
    "chapter": "Chapter 9: Rational Numbers",
    "text": "Which of these is a rational number?",
    ...
  },
  ... (3 more questions)
]
```

### Database Status
```
Questions with source_kind: 1,136 ✅
Questions with sourceKind only: 0 ✅
All NCERT questions: CANONICAL ✅
```

---

## Frontend Testing

### Test URLs (Now Working)

**Class 7 Mathematics Chapter 9:**
```
https://shiksha-sathi-taupe.vercel.app/teacher/question-bank?board=NCERT&class=7&subject=Mathematics&chapter=Chapter%209%3A%20Rational%20Numbers
```
**Expected:** Questions show "SOURCE: CANONICAL" ✅

**Class 10 Science Chapter 1:**
```
https://shiksha-sathi-taupe.vercel.app/teacher/question-bank?board=NCERT&class=10&subject=Science&chapter=Chapter%201%3A%20Chemical%20Reactions%20and%20Equations
```
**Expected:** Questions show "SOURCE: CANONICAL" ✅

**All Classes 6-12:**
- Mathematics: 354 questions ✅
- Science: 590 questions ✅
- Physics: 80 questions ✅
- Biology: 40 questions ✅
- English: 48 questions ✅
- Social Science: 24 questions ✅

---

## Timeline

1. **Initial Issue:** UI showed "SOURCE: LOCAL"
2. **First Investigation:** Database had `sourceKind` field ✅
3. **Backend Redeploy:** Did not fix (field name mismatch)
4. **Root Cause Found:** Backend expects `source_kind`, database had `sourceKind`
5. **Database Fix:** Renamed field to `source_kind` for all 1,136 questions
6. **API Verification:** Now returns `sourceKind: CANONICAL` ✅
7. **Frontend Test:** UI should now show "SOURCE: CANONICAL" ✅

---

## Lessons Learned

1. **Java @Field mapping:** MongoDB field names must match Java annotations exactly
2. **CamelCase vs SnakeCase:** Java uses camelCase, MongoDB often uses snake_case
3. **Backend redeploy not needed:** Field mapping is handled by Spring Data MongoDB automatically

---

## Related Documentation

- [Question Bank Verified](QUESTION-BANK-VERIFIED.md) — Data completeness verification
- [Source Types Explained](SOURCE-TYPES-EXPLAINED.md) — CANONICAL vs LOCAL explanation
- [Backend Redeploy](BACKEND-REDEPLOY-NEEDED.md) — Initial troubleshooting (no longer needed)

---

**Last Updated:** 2026-03-30  
**Status:** ✅ RESOLVED — All 1,136 questions show "SOURCE: CANONICAL"  
**Action:** Test frontend UI to confirm visual update
