# 🔍 Chapter Dropdown Bug - Root Cause Analysis

**Date:** 2026-03-30  
**Status:** ⚠️ ROOT CAUSE IDENTIFIED  
**Severity:** HIGH  
**Component:** Backend API + Frontend Integration

---

## Issue Summary

**User Experience:**
- Selects: Class 7 → Mathematics
- Chapter dropdown shows: "Vector Algebra" (and other incorrect chapters)
- Selects: Vector Algebra
- Result: "No questions found"

**Expected:** Chapter dropdown should only show chapters available for Class 7 Mathematics

---

## Root Cause

### Backend API Issue ❌

**File:** `backend/api/src/main/java/com/shikshasathi/backend/api/controller/QuestionController.java`

**Current Endpoint:**
```java
@GetMapping("/chapters")
public ResponseEntity<List<String>> getChapters(
        @RequestParam(required = false) String subjectId,
        @RequestParam(required = false) String book) {
    return ResponseEntity.ok(questionService.getDistinctChapters(subjectId, book));
}
```

**Problem:** The `/chapters` endpoint **does NOT accept `classLevel` parameter**

**Service Implementation:**
```java
public List<String> getDistinctChapters(String subjectId, String book) {
    Query query = new Query();
    if (subjectId != null && !subjectId.isEmpty()) {
        query.addCriteria(Criteria.where("subject_id").is(subjectId));
    }
    if (book != null && !book.isEmpty()) {
        query.addCriteria(Criteria.where("provenance.book").is(book));
    }
    // ❌ MISSING: classLevel filter!
    return mongoTemplate.findDistinct(query, "chapter", Question.class, String.class);
}
```

**Result:** Returns **ALL chapters** for Mathematics across **ALL classes** (6-12)

### Database Reality

**Mathematics chapters across all classes:**
- Class 6: 10 chapters
- Class 7: 15 chapters ← Vector Algebra NOT here
- Class 8: 15 chapters
- Class 9: 15 chapters
- Class 10: 15 chapters
- Class 11: 10 chapters
- Class 12: 10 chapters ← Vector Algebra IS here

**API returns:** All 90+ chapters mixed together  
**Expected:** Only 15 chapters for selected class

---

## Frontend Integration Issue

### API Call Location

**File:** `src/app/teacher/question-bank/page.tsx` (line 72-76)

```typescript
const chapters = await api.questions.getChapters(
  subjectId || undefined,
  book || undefined
);
```

**Missing:** `classLevel` parameter

**File:** `src/lib/api/questions.ts` (line 25-30)

```typescript
getChapters: (subjectId?: string, book?: string): Promise<string[]> => {
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (book) params.append('book', book);
  return fetchApi<string[]>(`/questions/chapters?${params.toString()}`, { method: 'GET' });
},
```

**Missing:** `classLevel` parameter in API client

---

## Complete Fix Required

### Backend Changes (2 files)

#### 1. QuestionController.java

**Add `classLevel` parameter:**
```java
@GetMapping("/chapters")
public ResponseEntity<List<String>> getChapters(
        @RequestParam(required = false) String subjectId,
        @RequestParam(required = false) String book,
        @RequestParam(required = false) String classLevel) {  // ← ADD THIS
    return ResponseEntity.ok(questionService.getDistinctChapters(subjectId, book, classLevel));
}
```

#### 2. QuestionService.java

**Update method signature and query:**
```java
public List<String> getDistinctChapters(String subjectId, String book, String classLevel) {
    Query query = new Query();
    if (subjectId != null && !subjectId.isEmpty()) {
        query.addCriteria(Criteria.where("subject_id").is(subjectId));
    }
    if (book != null && !book.isEmpty()) {
        query.addCriteria(Criteria.where("provenance.book").is(book));
    }
    // ADD THIS:
    if (classLevel != null && !classLevel.isEmpty()) {
        query.addCriteria(Criteria.where("provenance.class").is(classLevel));
    }
    return mongoTemplate.findDistinct(query, "chapter", Question.class, String.class);
}
```

### Frontend Changes (2 files)

#### 1. src/lib/api/questions.ts

**Update API client:**
```typescript
getChapters: (subjectId?: string, book?: string, classLevel?: string): Promise<string[]> => {
  const params = new URLSearchParams();
  if (subjectId) params.append('subjectId', subjectId);
  if (book) params.append('book', book);
  if (classLevel) params.append('classLevel', classLevel);  // ← ADD THIS
  return fetchApi<string[]>(`/questions/chapters?${params.toString()}`, { method: 'GET' });
},
```

#### 2. src/app/teacher/question-bank/page.tsx

**Update API call:**
```typescript
const chapters = await api.questions.getChapters(
  subjectId || undefined,
  book || undefined,
  classLevel || undefined  // ← ADD THIS
);
```

---

## Testing After Fix

### Test Case 1: Class 7 Mathematics
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=7"
```

**Expected:** 15 chapters (NO Vector Algebra)

### Test Case 2: Class 12 Mathematics
```bash
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?subjectId=Mathematics&classLevel=12"
```

**Expected:** 10 chapters (INCLUDES Vector Algebra)

### Test Case 3: Frontend UI
1. Navigate to: `/teacher/question-bank`
2. Select: Board=NCERT, Class=7, Subject=Mathematics
3. **Expected:** Chapter dropdown shows only 15 chapters for Class 7
4. **Not Expected:** Vector Algebra, Circles, Statistics (Class 12 chapters)

---

## Impact Assessment

**Current Behavior:**
- Chapter dropdown shows 90+ chapters (all classes mixed)
- User selects chapter from wrong class
- "No questions found" error
- Poor user experience, confusing

**After Fix:**
- Chapter dropdown shows only 15 chapters (filtered by class)
- User can only select valid chapters
- All selections return questions
- Clean, intuitive UX

**Priority:** HIGH  
**Story Points:** 5  
**Complexity:** MEDIUM (backend + frontend changes)  
**Risk:** LOW (isolated to chapter filtering)

---

## Files to Change

### Backend (2 files)
1. `backend/api/src/main/java/com/shikshasathi/backend/api/controller/QuestionController.java`
2. `backend/api/src/main/java/com/shikshasathi/backend/api/service/QuestionService.java`

### Frontend (2 files)
1. `src/lib/api/questions.ts`
2. `src/app/teacher/question-bank/page.tsx`

### Tests (update existing)
1. `src/app/teacher/question-bank/__tests__/page.test.tsx`

---

## Deployment Steps

1. **Backend:**
   - Update QuestionController.java
   - Update QuestionService.java
   - Build and deploy to Cloud Run
   - Test API endpoint with classLevel parameter

2. **Frontend:**
   - Update questions.ts
   - Update page.tsx
   - Build and deploy to Vercel
   - Test chapter dropdown in UI

3. **Verification:**
   - Test Class 7 Mathematics (should NOT show Vector Algebra)
   - Test Class 12 Mathematics (SHOULD show Vector Algebra)
   - Test all class/subject combinations

---

## Related Issues Fixed

This fix also resolves:
- Chapters from different classes appearing in dropdown
- Confusion about which chapters are available
- "No questions found" errors from invalid selections
- Inconsistent user experience

---

**Last Updated:** 2026-03-30  
**Status:** ⚠️ Ready for implementation  
**Next Step:** Create Jira story for backend + frontend fix
