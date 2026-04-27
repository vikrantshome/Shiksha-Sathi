# Worksheets Design Spec
**Date:** 2026-04-26

## 1. Overview
Teachers need a "Google Sheets"-style view to assess assignment data at a glance. We are building two integrated spreadsheet views to satisfy this requirement:
1. **Class Gradebook View**: Rows are students, columns are assignments. Shows aggregate scores.
2. **Grading Worksheet View**: Rows are students, columns are questions. Shows individual answers and allows manual grade overrides.

## 2. Integrated Tabs Navigation
- **Assignments Dashboard** (`/teacher/assignments`):
  - Add a toggle: `[List View | Class Worksheet]`.
  - In `Class Worksheet` mode, the user selects a Class from a dropdown to load the grid.
- **Assignment Details** (`/teacher/assignments/[id]`):
  - Add a toggle: `[Report View | Grading Worksheet]`.
  - The `Grading Worksheet` mode displays the grid for the specific assignment.

## 3. Spreadsheet Component
- Develop a fast, responsive data grid component (`DataGrid` or similar).
- Fixed left column (Student Name/Roll No).
- Scrollable data columns.
- Editable cells for the `Grading Worksheet` to allow score overrides.
- Visual indicators for AI-graded vs. Manually-graded vs. Pending.

## 4. API Changes
- **Backend**: Add a new endpoint `PATCH /api/assignments/{id}/grades` (or similar) to handle fast, cell-based grading updates.
- **Frontend**: Connect the grid to this endpoint to auto-save score edits without full page reloads.

## 5. Future Advancements Note
We have captured the requirement for a "Full Assessment Tool" (inline comments, rich feedback threads inside spreadsheet cells, rubrics). This is out of scope for the current iteration but has been noted for future development.