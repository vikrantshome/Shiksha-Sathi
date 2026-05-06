# Shiksha Sathi API Documentation

**Base URL**: `http://localhost:8080/api/v1` (dev)  
**Production**: Configure via `NEXT_PUBLIC_API_URL` environment variable

## Authentication

Most endpoints require JWT authentication. Use the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Getting a Token

1. **Login**: `POST /api/v1/auth/login` with email/phone and password
2. **Signup**: `POST /api/v1/auth/signup` with user details

The response includes a `token` field used for subsequent requests.

### Public Endpoints

The following endpoints do NOT require authentication:
- `GET /api/v1/questions/**` - Read questions
- `GET /api/v1/derived-questions/**` - Read derived questions
- `GET /api/v1/assignments/link/{linkId}` - Get assignment by link
- `GET /api/v1/assignments/code/{code}` - Get assignment by code
- `POST /api/v1/submissions` - Submit assignment
- `GET /api/v1/schools/search` - Search schools
- `GET /api/v1/classes/student/{studentId}/attendance` - Student attendance
- `POST /api/v1/derived-questions` - Submit derived questions (admin review)

---

## Endpoints

### AuthController

**Base Path**: `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Login with email/phone and password | No |
| POST | `/signup` | Register new user | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update current user profile | Yes |

#### POST /api/v1/auth/login

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
OR for phone login:
```json
{
  "phone": "+911234567890",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "TEACHER"
  }
}
```

#### POST /api/v1/auth/signup

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+911234567890",
  "password": "password123",
  "role": "TEACHER",
  "school": "Delhi Public School"
}
```

#### GET /api/v1/auth/me

**Response**:
```json
{
  "id": "...",
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+911234567890",
  "role": "TEACHER",
  "school": "Delhi Public School",
  "schoolId": "...",
  "studentClass": "10",
  "section": "A"
}
```

---

### QuestionController

**Base Path**: `/api/v1/questions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subjects` | Get distinct subjects | No |
| GET | `/boards` | Get distinct boards | No |
| GET | `/classes` | Get distinct class levels | No |
| GET | `/books` | Get distinct books | No |
| GET | `/chapters` | Get distinct chapters | No |
| GET | `/chapters-meta` | Get chapter metadata | No |
| GET | `/counts-by-class` | Get question counts by class | No |
| GET | `/search` | Search questions | No |
| GET | `/{id}` | Get question by ID | No |
| POST | `/` | Create new question | Yes |

#### GET /api/v1/questions/search

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| board | String | Education board (e.g., "CBSE") |
| classLevel | String | Class level (e.g., "10") |
| subjectId | String | Subject ID |
| book | String | Book name |
| chapterNumber | Integer | Chapter number |
| chapterTitle | String | Chapter title |
| chapter | String | Chapter name |
| q | String | Search query |
| type | String | Question type (default: ALL) |
| approvedOnly | Boolean | Only approved questions |
| visibleOnly | Boolean | Only visible questions |

**Example**:
```
GET /api/v1/questions/search?board=CBSE&classLevel=10&subjectId=math&chapterNumber=1
```

#### GET /api/v1/questions/chapters-meta

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| board | String | Education board |
| classLevel | String | Class level |
| subjectId | String | Subject ID |
| book | String | Book name |
| visibleOnly | Boolean | Only visible chapters |

**Response**:
```json
[
  {
    "chapterNumber": 1,
    "chapterTitle": "Real Numbers",
    "questionCount": 45
  }
]
```

---

### DerivedQuestionController

**Base Path**: `/api/v1/derived-questions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get derived questions | No |
| POST | `/{id}/approve` | Approve derived question | Yes |
| POST | `/{id}/reject` | Reject derived question | Yes |
| POST | `/publish` | Publish approved questions | Yes |

#### GET /api/v1/derived-questions

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | String | Filter by status (PENDING, APPROVED, REJECTED) |
| chapter | String | Filter by chapter |

#### POST /api/v1/derived-questions/{id}/approve

**Request Body** (optional):
```json
{
  "notes": "Looks good"
}
```

#### POST /api/v1/derived-questions/{id}/reject

**Request Body** (optional):
```json
{
  "reason": "Incorrect answer"
}
```

#### POST /api/v1/derived-questions/publish

**Request Body**:
```json
{
  "chapter": "Real Numbers"
}
```

---

### AssignmentController

**Base Path**: `/api/v1/assignments`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/{assignmentId}` | Get assignment by ID | Yes |
| GET | `/link/{linkId}` | Get assignment by link | No |
| GET | `/code/{code}` | Get assignment by code | No |
| GET | `/class/{classId}` | Get assignments for class | Yes |
| GET | `/teacher/{teacherId}` | Get teacher's assignments | Yes |
| GET | `/teacher/{teacherId}/stats` | Get assignments with stats | Yes |
| GET | `/{assignmentId}/report` | Get assignment report | Yes |
| POST | `/` | Create assignment | Yes |
| POST | `/{assignmentId}/publish` | Publish assignment | Yes |
| PATCH | `/{assignmentId}/grades` | Update grades | Yes |
| GET | `/class/{classId}/gradebook` | Get class gradebook | Yes |
| GET | `/class/{classId}/export-sheets` | Export to Google Sheets | Yes |

#### GET /api/v1/assignments/link/{linkId}

**Public endpoint** - Students access assignments via this link.

**Response**:
```json
{
  "id": "...",
  "title": "Math Chapter 1 Assignment",
  "description": "Complete all questions",
  "subjectId": "math",
  "dueDate": "2024-12-31T23:59:00Z",
  "maxScore": 50,
  "questions": [...],
  "status": "PUBLISHED"
}
```

#### POST /api/v1/assignments/{assignmentId}/publish

Publishes the assignment making it visible to students.

---

### AssignmentSubmissionController

**Base Path**: `/api/v1/submissions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/assignment/{assignmentId}` | Get submissions for assignment | Yes |
| GET | `/student/{studentId}` | Get student's submissions | Yes |
| GET | `/{submissionId}` | Get submission by ID | Yes |
| POST | `/` | Submit assignment | No |

#### POST /api/v1/submissions

**Public endpoint** - Students submit assignments.

**Request Body**:
```json
{
  "assignmentId": "...",
  "studentId": "...",
  "studentName": "John Doe",
  "studentRollNumber": "25",
  "school": "Delhi Public School",
  "studentClass": "10",
  "section": "A",
  "answers": {
    "questionId1": "answer text",
    "questionId2": "answer text"
  }
}
```

**Response**:
```json
{
  "id": "...",
  "assignmentId": "...",
  "score": 45,
  "status": "SUBMITTED",
  "submittedAt": "2024-12-15T10:30:00Z"
}
```

---

### QuizController

**Base Path**: `/api/v1/quizzes`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new quiz | Yes |
| GET | `/teacher/{teacherId}` | List teacher's quizzes | Yes |
| GET | `/{quizId}` | Get quiz by ID | Yes |
| POST | `/{quizId}/publish-self-paced` | Publish as self-paced | Yes |
| POST | `/{quizId}/start-session` | Start live session | Yes |
| GET | `/code/{code}` | Get quiz by self-paced code | Yes |

#### POST /api/v1/quizzes

**Request Body**:
```json
{
  "classId": "...",
  "title": "Math Quiz",
  "description": "Chapter 1 test",
  "questionIds": ["q1", "q2", "q3"],
  "questionPointsMap": {
    "q1": 5,
    "q2": 5,
    "q3": 10
  },
  "timePerQuestionSec": 30,
  "selfPacedEnabled": false
}
```

---

### QuizSessionController

**Base Path**: `/api/v1/quiz-sessions`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/join` | Join quiz session | Yes |
| GET | `/{sessionId}/state` | Get student session state | Yes |
| POST | `/{sessionId}/answer` | Submit answer | Yes |
| GET | `/{sessionId}/teacher-state` | Get teacher session state | Yes |
| POST | `/{sessionId}/lock` | Lock/unlock session | Yes |
| POST | `/{sessionId}/start` | Start quiz | Yes |
| POST | `/{sessionId}/reveal` | Reveal answers | Yes |
| POST | `/{sessionId}/next` | Next question | Yes |
| POST | `/{sessionId}/end` | End quiz | Yes |
| GET | `/{sessionId}/report` | Get session report | Yes |

#### POST /api/v1/quiz-sessions/join

**Request Body**:
```json
{
  "sessionCode": "ABC123"
}
```

#### POST /api/v1/quiz-sessions/{sessionId}/answer

**Request Body**:
```json
{
  "answer": "B"
}
```

**Response**:
```json
{
  "correct": true,
  "correctAnswer": "B",
  "pointsEarned": 5
}
```

---

### QuizAttemptController

**Base Path**: `/api/v1/quiz-attempts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Start self-paced quiz | Yes |
| POST | `/{attemptId}/submit` | Submit quiz attempt | Yes |

#### POST /api/v1/quiz-attempts

**Request Body**:
```json
{
  "quizId": "..."
}
```

#### POST /api/v1/quiz-attempts/{attemptId}/submit

**Request Body**:
```json
{
  "answers": {
    "questionId1": "A",
    "questionId2": "C"
  }
}
```

---

### ClassController

**Base Path**: `/api/v1/classes`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/{classId}` | Get class details | Yes |
| GET | `/{classId}/students` | Get enrolled students | Yes |
| GET | `/me` | Get teacher's classes | Yes |
| POST | `/` | Create new class | Yes |
| PATCH | `/{classId}/archive` | Archive class | Yes |
| DELETE | `/{classId}` | Delete class | Yes |
| GET | `/{classId}/attendance` | Get attendance for date | Yes |
| POST | `/{classId}/attendance` | Mark attendance | Yes |
| POST | `/{classId}/enroll` | Enroll student | Yes |
| DELETE | `/{classId}/students/{studentId}` | Remove student | Yes |
| PATCH | `/students/{studentId}` | Update student | Yes |
| POST | `/{classId}/attendance/bulk` | Bulk attendance | Yes |
| GET | `/{classId}/attendance/history` | Attendance history | Yes |
| GET | `/student/{studentId}/attendance` | Student's attendance | No |

#### POST /api/v1/classes

**Request Body**:
```json
{
  "name": "Class 10-A",
  "grade": "10",
  "section": "A",
  "schoolId": "..."
}
```

#### POST /api/v1/classes/{classId}/enroll

**Request Body**:
```json
{
  "studentIds": ["studentId1", "studentId2"]
}
```

#### POST /api/v1/classes/{classId}/attendance

**Request Body**:
```json
{
  "studentId": "...",
  "date": "2024-12-15",
  "status": "PRESENT"
}
```

---

### SchoolController

**Base Path**: `/api/v1/schools`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search` | Search schools | No |

#### GET /api/v1/schools/search?q=Delhi

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| q | String | Search query |

**Response**:
```json
[
  {
    "id": "...",
    "name": "Delhi Public School",
    "address": "New Delhi",
    "contactEmail": "info@dps.edu.in"
  }
]
```

---

### TeacherController

**Base Path**: `/api/v1/teachers`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get teacher profile | Yes |
| PUT | `/profile` | Update teacher profile | Yes |

#### GET /api/v1/teachers/profile

**Response**:
```json
{
  "userId": "...",
  "name": "John Doe",
  "school": "Delhi Public School",
  "board": "CBSE"
}
```

---

### AnalyticsController

**Base Path**: `/api/analytics`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/track` | Track analytics event | Yes |

#### POST /api/analytics/track

**Request Body**:
```json
{
  "event": "page_view",
  "payload": {
    "page": "/dashboard",
    "source": "direct"
  }
}
```

---

### PublishController

**Base Path**: `/api/v1/questions` (shared)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/publish-status` | Get chapter publish status | Yes |
| GET | `/publish-status/summary` | Get class publish summary | Yes |
| GET | `/publish-dashboard` | Get dashboard statistics | Yes |
| POST | `/publish` | Publish chapter questions | Yes |
| POST | `/unpublish` | Unpublish questions | Yes |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

Currently not implemented. Future versions may include rate limiting per user/IP.

---

## Versioning

Current API version: **v1**

All endpoints are prefixed with `/api/v1/`. Future versions will follow semantic versioning.