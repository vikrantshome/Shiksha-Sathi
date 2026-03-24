# Homework App Analysis & PRD

**Overview:** *TheHomeworkApp* (by InfyBytes AI Labs) is an Indian edtech platform for K–10 teachers that lets them **auto-create and auto-grade** homework assignments in minutes【1†L69-L72】【28†L125-L133】. Key highlights include a **large pre‑typed question bank** (600K+ MCQs, fill‑in‑blanks, T/F, and descriptive questions)【1†L69-L72】【11†L115-L123】, instant homework generation, and shareable links. Teachers **create classes in ~30s**, select chapters/topics, choose questions, and the app generates quizzes/worksheets【28†L92-L100】【11†L125-L133】. Students simply click a link to do the homework【1†L157-L160】, the system auto-grades objective answers, and dashboards show class and student performance【11†L133-L140】【1†L88-L91】. The app boasts saving “up to 3 hours daily” for teachers and is free for schools, teachers, and students【1†L63-L72】【11†L146-L154】. 

## Core Features

- **Automated Assignment Creation.** Teachers can pick subjects/chapters and generate quizzes or worksheets in ~2 minutes【1†L69-L72】【11†L125-L133】. The app uses a massive curated question bank (RD Sharma, RS Aggarwal, Oswaal, etc.) organized by subject, chapter, and topic【28†L92-L100】【11†L115-L123】. This eliminates manual question entry.
- **Question Bank Access.** 600K+ pre-typed questions (MCQs, True/False, Fill‑in‑Blanks, Subjective) covering CBSE 1–10 (Math, Science, English, SST)【1†L69-L72】【28†L92-L100】. Teachers can search/filter questions by chapter or topic for easy selection【11†L115-L123】.
- **Class & Assignment Management.** Teachers create classes (name, section, strength) in ~30s【28†L92-L100】【11†L122-L124】. Assignments (homework, revision, quizzes) are tracked by class and subject.
- **Shareable Links & Integration.** Each assignment generates a unique shareable link (WhatsApp, Google Classroom, Teams)【1†L105-L110】【28†L98-L100】. Students click the link (no app install needed) to access homework【1†L157-L160】.
- **Automated Grading.** Objective questions (MCQs, T/F, etc.) are auto-graded immediately【11†L133-L139】【1†L164-L167】. The system “auto-corrects submissions and provides instant insights” without manual marking【11†L133-L139】.
- **Reporting & Analytics.** Teachers get real-time stats: how many students started/completed the assignment, topic-wise performance, and individual scores【11†L136-L140】【1†L88-L91】. The app provides detailed reports at class, student, and assignment levels【1†L150-L153】.
- **Student Experience.** Simple UI: students just open the link and complete answers online【1†L157-L160】. No need to upload photos. Unlimited cloud storage saves all submissions【1†L169-L174】, freeing device memory.
- **Reminders & Notifications.** The app notifies teachers when students start homework and allows sending reminders to students who haven’t begun【28†L99-L105】【11†L133-L139】.
- **Scalability & Plans.** Free basic plan for all users【1†L134-L139】. (Premium plans with advanced analytics, games, personalized study decks, etc. are planned【1†L178-L186】【28†L193-L201】.)

## User Roles & Flows

- **Teacher:** Signs up (via phone/email), creates/joins a class, and selects subject and student count【28†L92-L100】. In the “Create Assignment” flow, the teacher chooses subjects/topics from the question bank and composes a quiz or worksheet. The app auto-generates the assignment and scoring scheme. The teacher then shares a link (WhatsApp/Classroom). After assignment due date, the teacher views an analytics dashboard with scores, completion rates, and topic-wise insights【11†L136-L140】【1†L150-L153】. Teachers can resend reminders to pending students.
- **Student:** Receives an assignment link (no login needed) and opens it in a browser. The student answers questions (selecting MCQs, filling blanks, or entering short answers) and submits. The system immediately grades objective parts and shows the score. Students see feedback or correct answers after submission.
- **School Admin (optional):** An admin can bulk-add teachers or manage schools, but for MVP this is often manual or by invite. (The app’s marketing mentions “1600+ schools use the app across India”【1†L39-L42】, implying some school-level onboarding, though the core is teacher-driven.)
- **Parent (indirect):** Not a distinct user role in the MVP. Parents benefit passively from teacher reports (and the site mentions parents love the simple design【1†L56-L59】), but we won’t include a dedicated parent login for MVP.

The UI would include dashboards/lists for classes and assignments (teacher view), an assignment editor (select questions, set title/date), a student assignment page (question form), and an analytics page (charts/tables per class). The site screenshots (https://www.thehomeworkapp.ai) hint at a clean, mobile-friendly design (teacher panel, student tasks, reports).

## Competitor Analysis & Best Practices

Unlike general LMS tools, *TheHomeworkApp* tightly focuses on **homework automation**. For comparison:
- **Google Classroom / Edmodo:** These let teachers post assignments and materials, but typically require manual entry of questions or uploading files, and grading is manual (or via Google Forms). Classroom can send notifications, but lacks a built-in large question bank or auto-generation feature.
- **Quizizz / Kahoot:** These specialize in quizzes/games. They auto-grade quizzes but are often for in-class/game use, not permanent homework links. They usually rely on teachers creating each quiz manually.
- **Traditional Apps (e.g. Byju’s, Khan Academy):** More about learning content than assignment management. They don’t offer a teacher-driven assignment creation with class tracking.

In contrast, *TheHomeworkApp*’s USP is combining a curriculum-aligned question bank with instant assignment creation/sharing and auto-grading【28†L125-L133】【11†L133-L139】. This fits modern best practice: **minimize teacher workload** by automating rote tasks. For example, the app claims teachers can **“save almost 2 hours”** of daily homework work【11†L146-L149】. Industry trends (AI tutors, auto-grading tools) also emphasize speeding up grading and providing immediate feedback【34†L28-L33】【11†L133-L139】. Sharing via messaging/edu-platforms (WhatsApp, Google Classroom) follows current usage patterns【1†L105-L110】【28†L98-L100】.

**Best Practice Features to Adopt:** 
- **Mobile/Web Access:** Accessible via any device (the app supports Android/iOS web/mobile usage).
- **Instant Linking:** Use unique links for each assignment so students just click and start【28†L98-L100】.
- **Robust Question Taxonomy:** A searchable, categorized question bank is crucial【11†L115-L123】.
- **Auto-Notifications:** Automatic reminders and submission alerts reduce manual follow-up.
- **Data-Driven Feedback:** Visual dashboards (charts by topic, heat maps of wrong answers) help identify weak areas.

## MVP Feature List & Architecture

Based on the above analysis, a **Minimal Viable Product** should include:

- **User Accounts:** Teacher signup/login (via phone/email) and basic profile.
- **Class Management:** Create/Delete class (name, section, strength). (The app boasts “Create class in 30 seconds”【28†L92-L100】.)
- **Question Bank Module:** A database of curated questions. Teachers browse/select by subject/chapter.
- **Assignment Creation:** UI to compose an assignment by picking questions and assigning marks per question【11†L125-L133】.
- **Sharing:** Generate a shareable assignment link (for WhatsApp/Classroom)【1†L105-L110】.
- **Student Submission:** A student-side portal (opens on link) for submitting answers online.
- **Automatic Grading Engine:** Service to auto-grade objective answers and compute scores【11†L133-L139】.
- **Analytics Dashboard:** Show completion status and performance metrics (class average, top/bottom performers, topic-wise accuracy)【11†L136-L140】【1†L150-L153】.
- **Notifications/Reminders:** Automated alerts when students start/complete assignments and email/SMS reminders for tardy students.
- **Data Storage:** Cloud backend (e.g. AWS or similar) storing user data, questions, assignments, and submissions (the app advertises unlimited cloud storage【1†L169-L174】).
- **Tech Stack (example):** Web frontend (React or Angular), backend API (Node.js/Python), database (PostgreSQL or MongoDB for questions/submissions), authentication (JWT/OAuth), and possibly AI/ML modules for any advanced grading. A mobile-friendly responsive design is essential. 

*Optional (MVP+)*: Integration with Google Classroom API for class/student import, and real-time chat for parent/teacher communication.

## Proposed Jira Backlog (Epics & Stories)

Assuming we create a new Jira project **“HomeworkApp”**, the backlog is organized into major *Epics* with associated *User Stories*. Key epics include:

- **Epic: Teacher & Class Management**  
  - *Story:* As a teacher, I want to register/login using my email/phone so I can securely access the app.  
  - *Story:* As a teacher, I want to create a new class by entering class name, section, and student count in ~30 seconds【28†L92-L100】.  
  - *Story:* As a teacher, I want to view and edit my list of classes so I can manage multiple sections.  

- **Epic: Question Bank & Curriculum**  
  - *Story:* As a teacher, I want to browse a question bank by subject/chapter/topic so I can find relevant questions【11†L115-L123】.  
  - *Story:* As a teacher, I want to select/deselect questions (MCQ, T/F, Fill, Descriptive) and assign marks to each question when creating an assignment.  
  - *Story:* As an admin, I want to add or update questions in the bank so that content stays up to date.  

- **Epic: Assignment Creation & Sharing**  
  - *Story:* As a teacher, I want to generate a homework/quiz (worksheet) from selected questions so I don’t have to type questions manually【28†L92-L100】【11†L125-L133】.  
  - *Story:* As a teacher, I want the system to auto-generate a shareable link/QR code for the assignment so I can distribute it easily【28†L98-L100】.  
  - *Story:* As a teacher, I want to assign a due date/time and title for each assignment.  
  - *Story:* As a teacher, I want to share the assignment via WhatsApp/Google Classroom/Teams so students can receive it (integration API).  

- **Epic: Student Submission Workflow**  
  - *Story:* As a student, I want to click an assignment link and see all questions to answer online【1†L157-L160】.  
  - *Story:* As a student, I want to answer questions (select or type) and submit once complete.  
  - *Story:* As a student, I want immediate feedback (score for auto-gradable questions) and correct answers after submission【11†L133-L139】.  

- **Epic: Grading & Reports**  
  - *Story:* As the system, I should auto-grade objective questions (MCQ/T-F/Fill) and store results【11†L133-L139】.  
  - *Story:* As a teacher, I want to manually review/grade any subjective answers if needed.  
  - *Story:* As a teacher, I want to see a report of scores and analytics (how many attempted, average score, question-by-question stats) so I can assess class performance【11†L136-L140】【1†L150-L153】.  
  - *Story:* As a teacher, I want to filter reports by student or by question/topic to identify learning gaps.  

- **Epic: Notifications & Reminders**  
  - *Story:* As the system, I want to send a notification to the teacher when a student starts or completes an assignment.  
  - *Story:* As a teacher, I want to send reminders (e.g. via WhatsApp or email) to students who have not attempted the homework【28†L99-L105】.  
  - *Story:* As the system, I want to alert students about upcoming due dates (optional push notifications/email).  

- **Epic: Settings & Support**  
  - *Story:* As a teacher, I want to edit my profile (name, school, board) and adjust notification preferences.  
  - *Story:* As a school admin, I want to invite teachers or manage teacher accounts (invite/link) for school-wide rollout.  
  - *Story:* As a user, I want a FAQ/help section and contact support within the app.

Each epic and story aligns with features from *TheHomeworkApp*. For example, the “Assignment Creation” epic directly addresses the steps in their help text (“select chapters… automatically generate worksheets”【11†L125-L133】) and the “Grade & Reports” epic covers auto-grading and analytics (“no manual correction needed… instant insights”【11†L133-L139】). 

**Project Note:** Officially creating a new Jira project via Rovo isn’t supported out-of-the-box【22†L221-L229】, so these epics would typically be added under an existing project (or a workspace admin would manually create a “HomeworkApp” project first). Once the project exists, we would use Rovo’s `createJiraIssue` tool to add each Epic (issue type = Epic) and its child user stories, linking them appropriately. Each user story would follow the “As a [role], I want [feature], so that [benefit]” format and include acceptance criteria derived from the feature list above. 

**Sources:** We based this analysis on *The Homework App* official website and app descriptions【1†L69-L72】【28†L92-L100】【11†L133-L139】, which detail its workflow and capabilities. These guided our PRD and the Jira backlog outline.

