# 📚 Shiksha Sathi - User Stories Document

## 1. Actors (Roles)
- **Teacher:** The primary user of the platform who manages classes, browses the question bank, creates assignments, and reviews student performance.
- **Student:** The end-user who receives assignments, submits answers, and reviews their AI-graded feedback.
- **Admin / Content Reviewer:** The platform administrator responsible for managing the content pipeline, reviewing AI-generated questions, and publishing them to the live question bank.
- **System (AI):** The automated backend processes powered by the NVIDIA AI client and data pipelines that handle auto-grading and question derivation.

---

## 2. Teacher User Stories

### 2.1 Authentication & Profile Management
- **As a Teacher**, I want to sign up and log in securely so that I can access my personalized dashboard and data.
- **As a Teacher**, I want to manage and update my profile (including my school association) so that my account details are accurate.

### 2.2 Class & Student Management
- **As a Teacher**, I want to create new classes (cohorts) so that I can organize my students by grade, section, or subject.
- **As a Teacher**, I want to add/enroll students into my classes so that I can seamlessly distribute assignments to them.
- **As a Teacher**, I want to record and view student attendance for my classes so that I can track participation over time.
- **As a Teacher**, I want to delete a class when a semester or academic year ends to keep my dashboard clutter-free.

### 2.3 Question Bank Discovery
- **As a Teacher**, I want to browse the question bank hierarchically (by Board → Class → Subject → Book → Chapter) so that I can find curriculum-aligned (NCERT) content.
- **As a Teacher**, I want to use search and filtering tools on the question bank so that I can quickly locate specific topics or question types.
- **As a Teacher**, I want to see both canonical (original NCERT) questions and derived (AI-generated practice) questions so that I have a diverse pool of content for assignments.

### 2.4 Assignment Creation & Management
- **As a Teacher**, I want to create assignments by hand-picking questions from the question bank so that I can tailor assessments to my lesson plans.
- **As a Teacher**, I want to allocate specific point values to each question in an assignment so that I can weigh questions according to their difficulty.
- **As a Teacher**, I want to publish an assignment directly to a registered class or generate a unique shareable link/code so that students can access it easily.
- **As a Teacher**, I want to view a centralized list of all my active and past assignments to track what has been distributed.
- **As a Teacher**, I want to view an assignment report with aggregated statistics and individual student submissions so that I can gauge class comprehension and identify learning gaps.

---

## 3. Student User Stories

### 3.1 Access & Onboarding
- **As a Student**, I want to join a class or access a specific assignment using a shareable link or code so that I don't face a complex onboarding process.
- **As a Student**, I want to log into my student portal so that I can track my academic progress over time.

### 3.2 Taking Assignments & Reviewing Feedback
- **As a Student**, I want to view a dashboard of my pending assignments so that I know what homework is due.
- **As a Student**, I want to submit answers (including short and long text answers) to an assignment so that my work can be evaluated.
- **As a Student**, I want to receive instant, AI-generated grading and per-answer feedback on my submissions so that I can immediately understand my mistakes and learn from them without waiting for manual teacher grading.
- **As a Student**, I want to view a history of my past assignment results so that I can track my improvement over the academic year.

---

## 4. Admin / Content Reviewer User Stories

### 4.1 Content Pipeline & Publishing
- **As an Admin**, I want to access a unified publish dashboard so that I can monitor the status of the entire content pipeline (Pending → Approved → Published).
- **As an Admin**, I want to view a summary of publish statistics so that I can track the platform's content growth and coverage.
- **As an Admin**, I want to publish approved chapters of questions so that they instantly become available in the live question bank for teachers.
- **As an Admin**, I want to have the ability to unpublish specific content so that I can quickly remove questions if inaccuracies or errors are reported.

### 4.2 Derived Question Review Workflow
- **As an Admin**, I want to view a queue of AI-generated "derived" questions so that I can manually verify their accuracy and alignment with the curriculum.
- **As an Admin**, I want to approve or reject derived questions so that only high-quality, hallucination-free content makes it into the live question bank.

---

## 5. System (Non-Functional & AI) Stories

### 5.1 AI Auto-Grading & Content Generation
- **As the System**, I want to automatically evaluate and grade subjective student answers using the integrated NVIDIA AI client so that teachers are relieved of the manual grading burden.
- **As the System**, I want to run offline scripts to ingest raw NCERT PDF extractions into canonical database records.
- **As the System**, I want to procedurally generate practice variants (derived questions) based on canonical questions so that the platform's content scales autonomously.

### 5.2 Security, Analytics & Performance
- **As the System**, I want to secure all API endpoints using Spring Security and JWT Bearer tokens so that unauthorized access is prevented.
- **As the System**, I want to enforce Role-Based Access Control (RBAC) so that Students cannot access Teacher endpoints, and Teachers cannot access Admin publishing routes.
- **As the System**, I want to track user analytics and events so that the product team can understand feature usage and platform engagement.