# PRISM Prompt: Shiksha Sathi PRD + Jira Orchestration

Use the following prompt with your preferred LLM to convert the current research into a professional PRD, a Jira-ready backlog, and Atlassian-MCP-friendly issue creation payloads for Shiksha Sathi.

---

## Prompt

You are a senior Product Manager, Business Analyst, and Jira delivery architect for an Indian edtech SaaS product.

Use the PRISM framework below and produce an execution-ready product package for **Shiksha Sathi**, which is intentionally being built as a **basic MVP inspired by TheHomeworkApp**.

Do not optimize for originality yet. Optimize for shipping a practical first version with a clean product structure, clear scope, and Jira-ready work items.

## P — Purpose

Transform the research and constraints below into:

1. A professional **Product Requirements Document (PRD)**
2. A clear **MVP scope** with explicit **goals, non-goals, assumptions, constraints, and release criteria**
3. A complete **epic structure**
4. Detailed **user stories** with **acceptance criteria**
5. A **Jira-ready backlog** with priorities, dependencies, and recommended sequencing
6. A **post-MVP / low-priority backlog** for items we are intentionally deferring
7. A short **risk register** and **open questions list**
8. A set of **Atlassian MCP / Jira issue creation payloads** that can be used to create epics, stories, and tasks in the correct order

The final output should feel like something a startup product team can directly use for planning, design, engineering, and Jira issue creation through Atlassian MCP.

## R — Role

Act as:

- A pragmatic senior PM who can turn ambiguous research into a real product plan
- A delivery-focused BA who writes clean, testable requirements
- A Jira strategist who understands epics, stories, tasks, priorities, dependencies, and release planning
- An Atlassian operator who knows how to structure issue payloads for clean Jira project setup

Your tone must be professional, structured, and implementation-oriented.

Do not produce vague consultant language.
Do not repeat marketing fluff.
Do not over-index on future possibilities at the expense of MVP clarity.

## I — Inputs

### Product Intent

- Product name: **Shiksha Sathi**
- Goal: Build a **basic version of TheHomeworkApp** as a fast, usable MVP
- Current strategy: We are fine starting with a competitor-inspired first version and validating deeper product thinking after MVP launch
- Primary user: **Teacher**
- Secondary user: **Student**
- Initial emphasis: **web/mobile-friendly, low-friction, browser-first workflow**
- Desired execution path: **Set this up in Jira using Atlassian MCP**

### Jira Execution Inputs

Use these if provided. If not provided, make a recommendation and clearly label it as a recommendation:

- Jira site / workspace: [INSERT IF AVAILABLE]
- Existing Jira project key: [INSERT IF AVAILABLE]
- If no project exists, suggest a project name and project key
- Issue type hierarchy available in Jira: [Epic / Story / Task / Sub-task, or as available]
- Default labels to apply: [INSERT IF AVAILABLE]
- Components to use: [INSERT IF AVAILABLE]
- Assignee strategy: [optional]
- Sprint or milestone naming convention: [optional]

### Current MVP Direction

Treat the following as the intended MVP center of gravity:

- Teacher signup/login
- Class creation and management
- Question bank browsing and question selection
- Assignment creation
- Shareable assignment links
- Student opens link and submits answers online
- Auto-grading for objective question types
- Basic teacher analytics and reporting

### Explicit Deferrals / Lower Priority

These should be included as **post-MVP backlog**, **future epics**, or **low-priority risk/control tasks**, not as core MVP blockers unless absolutely necessary:

- School admin workflows
- Parent communication
- Reminders and notification automation
- Google Classroom / Teams / WhatsApp deep integrations
- Subjective-answer grading workflows
- Anti-cheating mechanisms
- Link misuse prevention
- Duplicate submission controls beyond basic safeguards
- Advanced analytics
- Premium plan features

### Product Context From Research

Base your work on the following competitor-inspired context:

- Teachers should be able to create homework quickly using a pre-structured question bank
- Students should be able to access homework through a simple link without heavy onboarding friction
- Objective questions should be auto-gradable
- Teachers should be able to track completion and view basic performance analytics
- The product should reduce teacher effort in homework creation, assignment distribution, and grading

### Important Working Assumptions

If details are missing, use the following assumptions unless they conflict with the research:

- Market: India
- Segment: K-10 schools/teachers
- Curriculum focus: Start with a structured curriculum-aligned question bank
- Delivery surface: Responsive web app
- Student access model: Link-based access with lightweight identity capture where needed
- MVP grading coverage: Objective questions first
- MVP design principle: Keep student flow as frictionless as possible
- Team reality: We need a plan that can be executed in phases, not a giant all-at-once platform

### Research Input

Use the current research draft as the source material and translate it into a Shiksha Sathi product plan.

[PASTE THE RESEARCH DOCUMENT HERE]

## S — Steps

Follow these steps in order:

1. Reframe the research from “competitor analysis” into **Shiksha Sathi product intent**
2. Write a **PRD** with missing sections completed:
   - Executive Summary
   - Problem Statement
   - Product Vision
   - Goals
   - Non-Goals
   - Success Metrics
   - User Personas
   - Assumptions
   - Constraints
   - Core MVP Scope
   - Out-of-Scope for MVP
   - Release Criteria
3. Define the **primary user journeys** for:
   - Teacher onboarding
   - Class creation
   - Assignment creation
   - Assignment sharing
   - Student submission
   - Teacher report viewing
4. Convert the PRD into a **Jira-ready backlog** organized by epics
5. For each epic, create detailed **user stories** with:
   - Story ID
   - Title
   - User story statement
   - Description
   - Acceptance criteria
   - Priority
   - Dependencies
   - Suggested release bucket
6. Separate the backlog into:
   - **MVP / P0**
   - **Should-have / P1**
   - **Later / P2**
7. Add a **risk and controls backlog** for lower-priority but important concerns such as identity, link misuse, duplicate submissions, and abuse prevention
8. Recommend a **Jira structure**:
   - Project name suggestion
   - Epic names
   - Labels
   - Components
   - Issue hierarchy
9. Produce **Atlassian-MCP-ready creation payloads** for:
   - Project setup recommendation
   - Epic creation order
   - Story creation order
   - Task / sub-task creation order
   - Suggested fields for summary, description, labels, priority, component, and parent/epic link
10. Recommend a **delivery sequence**:
   - Foundation
   - Teacher core workflow
   - Student workflow
   - Grading and reporting
   - Hardening / release readiness
11. Flag any assumptions you had to make and clearly mark them as assumptions

## M — Mandatory Output Format

Return the output in exactly this structure:

### 1. Product Summary
- Product Name
- One-line description
- Target users
- Core value proposition

### 2. PRD
- Executive Summary
- Problem Statement
- Product Vision
- Goals
- Non-Goals
- Success Metrics
- User Personas
- Assumptions
- Constraints
- MVP Scope
- Out of Scope for MVP
- Release Criteria

### 3. User Journeys
Provide concise end-to-end flows for:
- Teacher onboarding
- Create class
- Create and publish assignment
- Student completes assignment
- Teacher views results

### 4. Epic Structure
Provide a table with:
- Epic ID
- Epic Name
- Objective
- Included in MVP? (Yes/No)
- Priority

### 5. Detailed Jira Backlog
Provide a table with:
- Epic ID
- Story ID
- Story Title
- Persona
- User Story
- Description
- Acceptance Criteria
- Priority (P0/P1/P2)
- Dependency
- Release Bucket

### 6. Technical / Operational Tasks
List supporting tasks that may not fit cleanly as user stories, such as:
- Question bank setup
- Content operations
- Environment/configuration
- Analytics instrumentation
- QA/UAT readiness
- Release checklist items

### 7. Risk Register
Provide a short table with:
- Risk
- Why it matters
- Severity
- Suggested mitigation
- MVP now or later?

### 8. Open Questions
List the top unresolved questions that the team should answer before or during implementation.

### 9. Recommended Jira Setup
Include:
- Jira project recommendation or existing project usage note
- Suggested Jira project name
- Suggested Jira project key
- Suggested components
- Suggested labels
- Suggested issue hierarchy
- Suggested milestone or sprint grouping

### 10. Atlassian MCP Issue Creation Payloads
Provide:
- Suggested creation order
- Epic payload list
- Story payload list
- Task payload list
- Suggested field mapping for Jira

Format this section so it is easy to use with issue-creation tooling:
- One payload block per issue
- Include issue type
- Include summary
- Include description
- Include priority
- Include labels
- Include component where relevant
- Include parent/epic relationship where relevant
- Include release bucket
- Include dependency notes

## Output Quality Rules

- Be concrete and specific
- Write as if this will be used directly by founders, PMs, designers, and engineers
- Make the MVP feel realistically shippable
- Do not let deferred items pollute the MVP critical path
- If a feature is useful but not essential, move it to P1 or P2 instead of inflating MVP
- Acceptance criteria must be testable and implementation-friendly
- Prefer practical execution detail over buzzwords
- Keep the structure professional and clean
- Make the Jira setup output operational, not just descriptive
- Ensure payloads are easy to map into Atlassian MCP issue creation tools
- If Jira execution inputs are missing, clearly separate recommendations from confirmed inputs

## Additional Guidance

- Treat **teacher workflow** as the product backbone
- Treat **student friction reduction** as a key UX principle
- Treat **objective auto-grading** as core MVP scope
- Treat **subjective grading**, **admin management**, **deep integrations**, and **parent-facing features** as later unless a strong justification is given
- Where uncertainty exists, make the best product judgment and clearly mark it as an assumption

At the end, include a short section called **“Recommended MVP Cut Line”** that explicitly states:

- What absolutely must be built before first release
- What should be postponed to the next phase
- What can be tracked in Jira as low-priority future work

---

## Usage Note

For best results, paste the full contents of `Shiksha Sathi/deep-research-report.md` into the `[PASTE THE RESEARCH DOCUMENT HERE]` section before running this prompt.

If you plan to execute this in Jira immediately after generation, ask the model to keep issue descriptions concise but implementation-ready, with acceptance criteria written in bullet form suitable for direct Jira descriptions.
