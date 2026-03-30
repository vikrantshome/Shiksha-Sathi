# Stitch Manual Cleanup Playbook

Last updated: 2026-03-30
Primary Jira issue: `SSA-247`
Supporting checklist: `Shiksha Sathi/doc/stitch-board-curation-checklist.md`
Stitch project: `projects/15430468290006367405`

## Purpose

Use this playbook when you are inside the Stitch board and want to turn the current mixed screen set into one clean, product-truth-aligned source of reference.

## Before You Start

- Open Jira issue `SSA-247`.
- Open the Stitch project `Shiksha Sathi UI Refresh`.
- Keep `Shiksha Sathi/doc/stitch-board-curation-checklist.md` open.
- Do not delete anything until the preferred replacement screen is visible on the board.

## Cleanup Principles

- Keep one canonical desktop screen per shipped route or workflow surface.
- Keep responsive companions grouped under the matching desktop screen.
- Remove older screens only after the corrected replacement is clearly in place.
- Treat repo truth as final for product behavior and routing.
- Keep documentation artifacts off the live UI board.

## Recommended Cleanup Order

### 1. Stabilize The Canonical Desktop Layer

Make sure these are the desktop references that stay visible:

- `Shiksha Sathi Landing Page`
- `Teacher Signup - Refined`
- `Teacher Dashboard - Consolidated`
- `Classes Management - Refined`
- `Attendance Register - Shiksha Sathi`
- `Question Bank - Browse & Select`
- `Review & Organize Assignment`
- `Publish & Share Assignment - Refined`
- `Teacher Assignment Report`
- `Teacher Profile - Shiksha Sathi`
- `Identity Entry`
- `Assignment Taking`
- `Results`

### 2. Remove Or De-Emphasize Superseded Desktop Screens

Archive, hide, move aside, or otherwise de-emphasize these once the canonical replacements are confirmed:

- `Teacher Dashboard`
- `Teacher Dashboard - Shiksha Sathi`
- `Question Bank`
- `Question Bank - Select Questions`
- `Review and Organize Assignment`
- `Publish and Share Assignment`
- `Answer Questions`
- older `Teacher Signup - Shiksha Sathi`
- older duplicate `Classes Management - Shiksha Sathi` screens
- older duplicate `Teacher Profile - Shiksha Sathi` screen

### 3. Remove The PRD From The UI Board

Move `Product Requirements Document` out of the live UI board or relabel it so nobody mistakes it for a shipped product surface.

### 4. Group Responsive Companions Under Each Desktop Parent

Place these under the matching desktop surface:

Dashboard
- `Teacher Dashboard (Tablet)`
- `Teacher Dashboard (Mobile)`

Classes
- `Classes Management (Tablet)`
- `Classes Management (Mobile)`

Attendance
- `Attendance Register (Tablet)`
- `Attendance Register (Mobile)`

Question Bank
- `Question Bank (Tablet)`
- `Question Bank (Mobile)`

Publish And Share
- `Publish & Share (Tablet)`
- `Publish & Share (Mobile)`

Signup
- `Teacher Signup (Tablet)`
- `Teacher Signup (Mobile)`

Profile
- `Teacher Profile (Tablet)`
- `Teacher Profile (Mobile)`

Assignment Report
- `Assignment Report (Tablet)`
- `Assignment Report (Mobile)`

## Suggested Board Layout

If Stitch supports free placement or grouping, use this order from left to right:

1. Landing
2. Signup
3. Teacher dashboard
4. Classes
5. Attendance
6. Question bank
7. Review
8. Publish/share
9. Assignment report
10. Teacher profile
11. Student identity
12. Student answer flow
13. Student results

If possible, keep each tablet/mobile pair directly below its desktop parent.

## Route Truth Reminder

The shipped routes this board should represent are:

- `/`
- `/login`
- `/signup`
- `/teacher`
- `/teacher/dashboard`
- `/teacher/classes`
- `/teacher/classes/[id]/attendance`
- `/teacher/question-bank`
- `/teacher/assignments/create`
- `/teacher/assignments/[id]`
- `/teacher/profile`
- `/student/assignment/[linkId]`

## What Should Not Reappear

While cleaning up, do not keep screens that imply unsupported product behavior such as:

- standalone analytics or stats product destinations
- live-class scheduling
- Google Classroom publishing
- settings or support routes presented as shipped product destinations
- off-brand product naming like `The Academic Curator`, `The Scholarly Sanctuary`, or `Question Bank Professional`

## Quick Verification Pass

After cleanup, verify these questions one by one:

- Can a designer identify the one correct desktop screen for each shipped surface in under a minute?
- Are the teacher workflow steps visible in the right order?
- Are the publish/share screens link-based rather than external-share-based?
- Is attendance visible as a first-class shipped surface?
- Are tablet/mobile companions present for the corrected teacher/auth/report surfaces?
- Is the PRD no longer mixed into the UI artifact set?

## Jira Closeout Note

When the board cleanup is done, add a Jira update to `SSA-247` summarizing:

- which screens were kept as canonical
- which legacy screens were archived or de-emphasized
- whether attendance and responsive variants are now visible on the board
- whether any parity gaps still remain

## Current Limitation

The current Stitch MCP surface used during the parity audit does not expose delete, archive, reorder, or pin controls. This playbook exists so the final cleanup can still be executed confidently through the Stitch UI or another board-management surface.
