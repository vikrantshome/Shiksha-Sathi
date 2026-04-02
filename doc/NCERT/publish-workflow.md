# NCERT Content Publishing Workflow

This document defines the publishing workflow for NCERT canonical and derived questions.

## Overview

**Publishing** is the final step that makes approved content visible to teachers in the question bank. Only content that has passed QA and provenance checks should be published.

## Publishing States

| State | Description | Visible to Teachers |
|-------|-------------|---------------------|
| **DRAFT** | Content under review/editing | ❌ No |
| **APPROVED** | Content passed QA, ready to publish | ❌ No |
| **PUBLISHED** | Content live in question bank | ✅ Yes |
| **REJECTED** | Content failed QA review | ❌ No |

## Publishing Workflow

### Step 1: Content Extraction
- Extract canonical questions from NCERT PDFs
- Generate derived questions from approved canonical sources
- Set initial status: `DRAFT`

### Step 2: Quality Assurance
- Review answer accuracy
- Verify provenance metadata
- Check for completeness
- Update status: `APPROVED` or `REJECTED`

### Step 3: Publishing
- Batch publish approved content by chapter
- Update status: `PUBLISHED`
- Content becomes visible in teacher question bank

### Step 4: Monitoring
- Track published content usage
- Monitor teacher feedback
- Handle corrections/updates

## API Endpoints

### Get Publish Status by Chapter
```
GET /api/v1/questions/publish-status?board=NCERT&class=6&subject=Science&chapter=1
Response: {
  "chapter": "Chapter 1: The Wonderful World of Science",
  "totalQuestions": 4,
  "draftCount": 0,
  "approvedCount": 4,
  "publishedCount": 4,
  "rejectedCount": 0,
  "status": "PUBLISHED"
}
```

### Publish Approved Content
```
POST /api/v1/questions/publish
Body: {
  "board": "NCERT",
  "class": "6",
  "subject": "Science",
  "book": "Curiosity",
  "chapterNumber": 1
}
Response: {
  "publishedCount": 4,
  "status": "SUCCESS"
}
```

### Unpublish Content
```
POST /api/v1/questions/unpublish
Body: {
  "questionIds": ["q1", "q2", "q3"]
}
Response: {
  "unpublishedCount": 3,
  "status": "SUCCESS"
}
```

## Content Review Dashboard

Content reviewers need visibility into:
- Total chapters extracted per class/subject
- Approval rate per chapter
- Published vs draft vs rejected counts
- Pending review queue

## Teacher-Facing Behavior

When approval coverage is partial:
- Show only PUBLISHED questions
- Display chapter completion percentage
- Indicate when more content is coming
- Maintain clean, professional UX

Example:
```
Chapter 1: The Wonderful World of Science
✅ 4 questions available

Chapter 2: Exploring Magnets
⏳ Approved or draft content is still under review and not yet live
```

## Quality Gates

Before publishing, verify:
- [ ] All questions have complete provenance
- [ ] Answer keys are verified correct
- [ ] Explanations are pedagogically sound
- [ ] No duplicate questions in chapter
- [ ] Question types are appropriately varied
- [ ] Difficulty level matches grade

## Rollback Procedure

If published content has errors:
1. Unpublish affected chapter immediately
2. Correct the issues
3. Re-review and re-approve
4. Republish with version note

## Success Metrics

- Published content accuracy: >99%
- Teacher satisfaction with content quality
- Time from extraction to publish: <1 week per chapter
- Zero published content with critical errors
