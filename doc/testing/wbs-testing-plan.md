# 🧪 Testing Plan: WBS Implementations

This document outlines the testing strategy for the newly implemented features from the Work Breakdown Structure (WBS).

## Prerequisites
1. Ensure both the Spring Boot backend (`http://localhost:8080`) and the Next.js frontend (`http://localhost:3000`) are running.
2. Ensure you have a teacher account and an admin account (or a way to access the `/admin` route).

---

## 1. 🎓 Teacher: Student Enrollment UI

### 1.1 Objective
Verify that a teacher can view enrolled students for a specific class and manually add new students using their Roll Number / ID.

### 1.2 Test Steps
1. **Navigate**: Log in as a Teacher and go to `/teacher/classes`.
2. **Access**: Click on the "Enroll Students" button for any active class.
3. **Verify Empty State**: If no students are enrolled, the page should display the empty state ("No students enrolled yet").
4. **Action**: Enter a valid student ID (e.g., from a test student account) into the "Student ID / Roll Number" input field and click "Add Student".
5. **Verify Success**: The page should refresh (or show a success message) and the newly added student should appear in the "Class Roster" table/list with their correct name, email, and ID.
6. **Verify Error Handling**: Enter an invalid or non-existent student ID and click "Add Student". Verify that an appropriate error is handled (check console or UI if an error toast was implemented).

---

## 2. 📝 Teacher: Question Point Allocation

### 2.1 Objective
Verify that a teacher can edit the point values of selected questions during assignment creation and that these custom points are correctly calculated and submitted to the backend.

### 2.2 Test Steps
1. **Navigate**: Log in as a Teacher and navigate to the Question Bank (`/teacher/question-bank`).
2. **Action**: Select at least 2 questions to add to the assignment tray.
3. **Navigate**: Go to the "Create Assignment" page (`/teacher/assignments/create`).
4. **Verify UI**: Observe the selected questions in the list. Each question should have an editable number input field for its marks/points.
5. **Action**: Change the point values for the questions (e.g., change a 1-mark question to 5 marks).
6. **Verify Calculation**: Ensure the "Total Points" or "Max Score" displayed at the top or bottom of the form updates correctly based on the new point values.
7. **Action**: Fill in the remaining required fields (Title, Class, Due Date) and click "Publish Assignment".
8. **Verify Backend Submission**: Check the network request payload (using browser DevTools) for the `POST /api/v1/assignments` call. Ensure the `questionPointsMap` field is present and contains the updated point values mapped to their respective question IDs.

---

## 3. 🛡️ Admin: Unpublish Content Workflow

### 3.1 Objective
Verify that an admin can unpublish a previously published question, hiding it from the live question bank.

### 3.2 Test Steps
1. **Navigate**: Access the Admin Dashboard (`/admin`).
2. **Filter**: Use the status filter buttons to select "PUBLISHED".
3. **Verify UI**: Locate a published question in the list. It should display an "Unpublish" button (orange style).
4. **Action**: Click the "Unpublish" button.
5. **Verify Confirmation**: A browser confirmation dialog should appear asking, "Are you sure? This will hide this question from teachers."
6. **Action (Cancel)**: Click "Cancel". The question should remain in the list.
7. **Action (Confirm)**: Click "Unpublish" again and click "OK" in the confirmation dialog.
8. **Verify Success**: The question should be removed from the "PUBLISHED" list view.
9. **Verify System State**: Log in as a Teacher and browse the Question Bank for the chapter containing the unpublished question. Ensure the question is no longer visible.

---

## 4. ⚙️ System: Analytics & Event Tracking

### 4.1 Objective
Verify that critical user actions trigger the fire-and-forget telemetry utility and send the correct payloads to the backend analytics endpoint.

### 4.2 Test Steps
For this section, keep the browser Developer Tools (Network tab) open and filter for requests to `/api/v1/analytics/track` (or similar, depending on the exact backend route configuration).

1. **Test: Teacher Login**
   - **Action**: Log out and log back in as a Teacher (`/login`).
   - **Verify**: Check the Network tab for a POST request. The payload should contain `eventName: "teacher_logged_in"` and the teacher's email.

2. **Test: User Signup**
   - **Action**: Navigate to `/signup` and create a new Student or Teacher account.
   - **Verify**: Check the Network tab for a POST request. The payload should contain `eventName: "user_signed_up"`, the role, and the school.

3. **Test: Assignment Published**
   - **Action**: Follow the steps in Section 2 to create and publish a new assignment.
   - **Verify**: Check the Network tab for a POST request. The payload should contain `eventName: "assignment_published"`, the assignment ID, class ID, total questions, and total marks.

4. **Test: Assignment Submitted**
   - **Action**: Log in as a Student. Navigate to the assignment created in the previous step (using the share link/code). Answer the questions and click "Submit Assignment".
   - **Verify**: Check the Network tab for a POST request. The payload should contain `eventName: "assignment_submitted"`, the assignment ID, student ID, and total questions answered.

### 4.3 Resilience Test
1. **Action**: Temporarily block the analytics endpoint (e.g., using browser DevTools request blocking) or stop the backend server.
2. **Action**: Perform one of the tracked actions (e.g., login).
3. **Verify**: Ensure the UI does not freeze or display an error message to the user. The tracking failure should be handled silently in the background.