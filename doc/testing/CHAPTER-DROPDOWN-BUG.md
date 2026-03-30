# 🐛 UI Bug: Incorrect Chapter Options Shown

**Date:** 2026-03-30  
**Status:** ⚠️ FRONTEND BUG IDENTIFIED  
**Severity:** MEDIUM  
**Impact:** Users see chapters that don't have questions

---

## Issue

**User selects:**
- Board: NCERT
- Class: 7
- Subject: Mathematics
- Chapter: Vector Algebra (shown in dropdown)

**Result:** "No questions found matching your criteria"

**Expected:** Vector Algebra should NOT appear in Class 7 chapter dropdown

---

## Root Cause

The frontend chapter dropdown is **not properly filtered** by the selected Class + Subject combination.

### Database Reality

**Class 7 Mathematics chapters (15 chapters, 60 questions):**
- Chapter 1: Number Game ✅
- Chapter 2: Data Handling ✅
- Chapter 3: Data Handling ✅
- Chapter 4: Triangles ✅
- Chapter 5: Algebraic Expressions ✅
- Chapter 6: The Triangle and its Properties ✅
- Chapter 7: Congruence of Triangles ✅
- Chapter 8: Comparing Quantities ✅
- Chapter 9: Rational Numbers ✅
- Chapter 10: Practical Geometry ✅
- Chapter 11: Perimeter and Area ✅
- Chapter 12: Data Handling ✅
- Chapter 13: Algebraic Expressions ✅
- Chapter 14: Symmetry ✅
- Chapter 15: Visualising Solid Shapes ✅

**Vector Algebra:**
- ❌ Class 7: **0 questions**
- ✅ Class 12: **4 questions**

---

## Why This Happens

The chapter dropdown is likely populated from:
1. All chapters across all classes (unfiltered)
2. Cached chapter list from previous selection
3. Not re-fetching chapters when class changes

### Correct Behavior

When user selects:
- Class: 7
- Subject: Mathematics

The chapter dropdown should **only** show the 15 chapters listed above, NOT "Vector Algebra".

---

## Solution

### Frontend Fix Required

**File:** `src/components/QuestionBankFilters.tsx` or similar

**Logic:**
```typescript
// When class or subject changes, re-fetch chapters
useEffect(() => {
  if (selectedClass && selectedSubject) {
    fetchChapters(selectedClass, selectedSubject);
  }
}, [selectedClass, selectedSubject]);

// API call should be:
GET /api/v1/questions/chapters?class=7&subject=Mathematics
```

**Current Bug:**
- Chapters are fetched once and cached
- Not updated when class/subject changes
- Shows all chapters from all classes

---

## Workaround for Users

Until fixed, users should:

1. **Select Class first**
2. **Select Subject**
3. **Check chapter dropdown** - only select chapters that appear
4. **If "No questions found":** Try a different chapter

### Working Chapters for Class 7 Math

Users can select any of these (all have 4 questions each):
- Chapter 1: Number Game
- Chapter 4: Triangles
- Chapter 5: Algebraic Expressions
- Chapter 6: The Triangle and its Properties
- Chapter 7: Congruence of Triangles
- Chapter 8: Comparing Quantities
- Chapter 9: Rational Numbers ← **This one works!**
- Chapter 10: Practical Geometry
- Chapter 11: Perimeter and Area
- Chapter 12: Data Handling
- Chapter 13: Algebraic Expressions
- Chapter 14: Symmetry
- Chapter 15: Visualising Solid Shapes

---

## Testing After Fix

### Test Case 1: Class 7 Mathematics
1. Select Class 7
2. Select Mathematics
3. **Expected:** Chapter dropdown shows only 15 chapters listed above
4. **Not Expected:** Vector Algebra, Circles, Statistics, etc.

### Test Case 2: Class 12 Mathematics
1. Select Class 12
2. Select Mathematics
3. **Expected:** Chapter dropdown shows Vector Algebra ✅
4. Select Vector Algebra
5. **Expected:** 4 questions displayed ✅

### Test Case 3: Class Change
1. Select Class 12, Mathematics
2. Note chapters shown (includes Vector Algebra)
3. Change to Class 7
4. **Expected:** Chapter dropdown updates, Vector Algebra removed ✅

---

## API Verification

### Correct API Behavior

```bash
# Get chapters for Class 7 Math
curl "https://shiksha-sathi-backend-eyfdit56la-el.a.run.app/api/v1/questions/chapters?class=7&subject=Mathematics"

# Expected response (15 chapters, NO Vector Algebra)
["Chapter 1: Number Game", "Chapter 2: Data Handling", ...]
```

### Database Query

```javascript
// Chapters for Class 7 Mathematics
db.questions.distinct("chapter", {
  "provenance.class": "7",
  "provenance.subject": "Mathematics"
})
// Returns: 15 chapters (NO Vector Algebra)
```

---

## Related Issues

This is separate from the SOURCE: LOCAL issue which was fixed.

**Completed:**
- ✅ All 1,136 questions show "SOURCE: CANONICAL"
- ✅ Database has correct chapter data
- ✅ API returns correct chapters when queried

**Pending:**
- ❌ Frontend chapter dropdown not properly filtered
- ❌ UI shows chapters from all classes instead of selected class

---

## Impact Assessment

**User Impact:**
- Confusion when chapter shows but has no questions
- Extra time spent troubleshooting
- Perceived as "broken" functionality

**Data Impact:**
- None - data is correct in database
- API works correctly when called with proper parameters

**Priority:** MEDIUM
- Functionality works for correct chapter selections
- Bug is in UI filtering, not data or API

---

## Recommended Fix Timeline

**Sprint:** Next available sprint  
**Story Points:** 3-5  
**Complexity:** LOW (frontend filtering logic)  
**Risk:** LOW (isolated to chapter dropdown)

---

**Last Updated:** 2026-03-30  
**Status:** ⚠️ Frontend bug identified, fix pending  
**Workaround:** Use chapters that are actually available for selected class
