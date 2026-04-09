# 🏗️ Work Breakdown Structure: Pending Implementations

## 1. 🎓 Teacher: Student Enrollment UI
**User Story:** *As a Teacher, I want to add/enroll students into my classes so that I can seamlessly distribute assignments to them.*
**Current Status:** 🟡 **Partially Implemented** 
*(Backend API `api.classes.addStudents` exists, but there is no UI in `src/app/teacher/classes/page.tsx` to actually trigger student enrollment).*

* **1.1. Frontend UI Components**
  * **1.1.1.** Design and build an "Enroll Students" modal or dedicated sub-page for a specific class.
  * **1.1.2.** Create an input form to add students manually by Email/Roll Number.
  * **1.1.3.** (Optional but recommended) Create a CSV bulk-upload drag-and-drop zone for onboarding entire rosters at once.
* **1.2. State & Data Integration**
  * **1.2.1.** Connect the UI form to the `api.classes.addStudents` frontend client wrapper.
  * **1.2.2.** Implement success/error toast notifications for enrollment status.
  * **1.2.3.** Trigger a cache revalidation (`revalidatePath`) to instantly show the updated student count on the class dashboard.

## 2. 📝 Teacher: Question Point Allocation
**User Story:** *As a Teacher, I want to allocate specific point values to each question in an assignment so that I can weigh questions according to their difficulty.*
**Current Status:** 🟡 **Partially Implemented**
*(The `CreateAssignmentForm` calculates and displays fixed points inherited from the database canonical questions, but lacks the ability for the teacher to override or edit these values).*

* **2.1. Component Updates (`CreateAssignmentForm.tsx`)**
  * **2.1.1.** Replace the static point display (`<span>{question.points} Marks</span>`) with a controlled number input field.
  * **2.1.2.** Add validation to ensure points cannot be negative or zero.
* **2.2. State Management (`useAssignment` hook)**
  * **2.2.1.** Add an `updateQuestionPoints(questionId, newPoints)` function to the context.
  * **2.2.2.** Update the `totalMarks` recalculation logic to depend on the newly edited values instead of the static canonical values.
* **2.3. API Payload Alignment**
  * **2.3.1.** Ensure the `api.assignments.create` POST payload correctly maps the customized point values (overriding canonical points) so the backend saves the correct weightage.

## 3. 🛡️ Admin: Unpublish Content Workflow
**User Story:** *As an Admin, I want to have the ability to unpublish specific content so that I can quickly remove questions if inaccuracies or errors are reported.*
**Current Status:** 🟡 **Partially Implemented**
*(Backend endpoint `POST /api/v1/publish/unpublish` exists, but there is no UI component in `src/app/admin/page.tsx` allowing an admin to unpublish).*

* **3.1. Admin Dashboard UI**
  * **3.1.1.** Add a "Live Content / Published Chapters" data table to the admin view (currently heavily focused on the pending/approval queue).
  * **3.1.2.** Implement an "Unpublish" action button row for each live chapter.
* **3.2. Safety & Validation**
  * **3.2.1.** Build a strictly-worded Confirmation Dialog (e.g., *"Are you sure? This will hide these questions from teachers"*).
* **3.3. API & Cache Sync**
  * **3.3.1.** Wire the confirmation action to the frontend `api.publish.unpublish` caller.
  * **3.3.2.** Revalidate the `/admin` path and the global `/teacher/question-bank` cache so changes reflect instantly platform-wide.

## 4. ⚙️ System: Analytics & Event Tracking
**User Story:** *As the System, I want to track user analytics and events so that the product team can understand feature usage and platform engagement.*
**Current Status:** 🟡 **Partially Implemented**
*(Backend `AnalyticsController.java` with the `/track` endpoint is active, but a codebase search reveals no frontend components are actually emitting telemetry events).*

* **4.1. Core Telemetry Utility**
  * **4.1.1.** Create an async wrapper utility (`lib/analytics.ts`) to queue and batch send events to `api.analytics.track` without blocking the main UI thread.
* **4.2. Action Hooks (Instrumenting the UI)**
  * **4.2.1.** **Auth Events:** Hook into successful Logins / Signups.
  * **4.2.2.** **Teacher Events:** Fire events upon "Assignment Created", "Class Created", and "Content Published".
  * **4.2.3.** **Student Events:** Fire events upon "Assignment Started" and "Assignment Submitted".
* **4.3. Privacy & Error Handling**
  * **4.3.1.** Ensure the payload safely strips PII where necessary.
  * **4.3.2.** Make the tracking strictly "fire-and-forget" so network errors on tracking don't break the user's flow.