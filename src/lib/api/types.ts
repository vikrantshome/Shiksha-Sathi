export type Role = 'PARTNER' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role | string;
  schoolId?: string;
  school?: string;
  // Student-specific fields
  rollNumber?: string;
  studentClass?: string;
  section?: string;
}

export interface CandidateProfile {
  userId: string;
  name: string;
  school?: string;
  role: Role;
  studentClass?: string;
  section?: string;
}

export interface AuthResponse {
  token?: string;
  userId?: string;
  name?: string;
  school?: string;
  role?: Role;
  /** When multiple active users share the same phone (e.g., sibling students),
   * this field contains the candidate profiles for the frontend to show a picker. */
  candidates?: CandidateProfile[];
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ProfileRequest {
  name: string;
  school: string;
  board: string;
}

export interface ProfileResponse extends ProfileRequest {
  userId: string;
}

export interface ClassItem {
  id: string;
  name: string;
  section: string;
  grade?: string; // Grade/Class level (e.g., "10", "11")
  active: boolean;
  schoolId: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface ClassRequest {
  name: string;
  section: string;
  grade: string; // Grade/Class level (e.g., "10", "11")
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export interface Provenance {
  extractionRunId?: string;
  board: string;
  classLevel: string;
  subject: string;
  book: string;
  chapterNumber: number;
  chapterTitle: string;
  sourceFile: string;
  pageNumbers?: string;
  section?: string;
}

export interface Question {
  id: string;
  subjectId: string;
  chapter: string;
  topic: string;
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'FILL_IN_BLANKS' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
  sourceKind?: 'CANONICAL' | 'DERIVED';
  reviewStatus?: 'DRAFT' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  provenance?: Provenance;
  language?: string;
  generationRunId?: string;
  sourceCanonicalQuestionIds?: string[];
  derivedFromChapterId?: string;
  generationRationale?: string;
  reviewerNotes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  questionIds: string[];
  questionPointsMap?: Record<string, number>;
  dueDate: string;
  maxScore: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  linkId: string;
  code: string; // Short 6-char code for student entry
  totalMarks: number;
}

export interface AssignmentWithStats extends Assignment {
  className: string;
  submissionCount: number;
  averageScore: number;
  linkId: string;
  code: string;
  totalMarks: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  answers: Record<string, string | string[]>;
  score: number;
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADED';
}

export interface AssignmentByLinkResponse {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  totalMarks: number;
  questions: Omit<Question, 'correctAnswer'>[];
}

export interface QuestionFeedbackDTO {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string | string[];
  isCorrect: boolean;
  marksAwarded: number;
  reasoning?: string;
  confidence?: number;
  aiGradingFailed?: boolean;
}

export interface SubmitAssignmentResponse {
  success: boolean;
  score: number;
  totalMarks: number;
  feedback?: QuestionFeedbackDTO[];
}

export interface QuestionPerformance {
  questionId: string;
  text: string;
  topic: string;
  marks: number;
  correctPercentage: number;
}

export interface AssignmentReport {
  assignment: AssignmentWithStats;
  submissions: AssignmentSubmission[];
  questionStats: QuestionPerformance[];
}

/* ── Backend DTO (maps to /submissions/student/{studentId}) ── */

export interface SubmissionDTO {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  assignmentLinkId?: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  school?: string;
  studentClass?: string;
  section?: string;
  answers: Record<string, string | string[]>;
  score: number;
  totalMarks?: number;
  submittedAt: string;
  status: string;
  /** AI-graded feedback per question (populated when fetching single submission for results). */
  feedback?: QuestionFeedbackDTO[];
}

/* ── Student Dashboard Types ── */

export interface StudentSubmissionSummary {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentLinkId: string;
  studentName: string;
  studentRollNumber: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
  status: "SUBMITTED" | "GRADED";
}

export interface StudentDashboardStats {
  totalAssignments: number;
  submittedCount: number;
  gradedCount: number;
  averageScorePercent: number;
  bestScorePercent: number;
  recentSubmissions: StudentSubmissionSummary[];
}

export interface StudentIdentity {
  studentId: string;
  studentName: string;
  school: string;    // School/Institute name
  class: string;     // Class/Grade (e.g., "10")
  section: string;   // Section/Division (e.g., "A")
  storedAt: string;
}
