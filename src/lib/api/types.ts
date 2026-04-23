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
  birthDate?: string;
}

export interface CandidateProfile {
  userId: string;
  name: string;
  school?: string;
  role: Role;
  studentClass?: string;
  section?: string;
  rollNumber?: string;
}

export interface AuthResponse {
  token?: string;
  userId?: string;
  name?: string;
  school?: string;
  role?: Role;
  studentClass?: string;
  section?: string;
  rollNumber?: string;
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

export interface ChapterMeta {
  chapterNumber: number;
  chapterTitle?: string | null;
  label: string;
  count: number;
}

export interface Question {
  id: string;
  subjectId: string;
  chapter?: string | null;
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
  explanation?: string;
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

/* ── Quiz Types ── */

export interface Quiz {
  id: string;
  teacherId: string;
  classId: string;
  title: string;
  description?: string;
  questionIds: string[];
  questionPointsMap?: Record<string, number>;
  timePerQuestionSec?: number;
  selfPacedEnabled?: boolean;
  selfPacedCode?: string;
  publishedAt?: string;
}

export interface StartQuizSessionResponse {
  sessionId: string;
  sessionCode: string;
}

export interface JoinQuizSessionResponse {
  sessionId: string;
  sessionCode: string;
  status: 'LOBBY' | 'LIVE' | 'REVEAL' | 'ENDED' | string;
}

export interface QuizSession {
  id: string;
  quizId: string;
  teacherId: string;
  classId: string;
  sessionCode: string;
  status: 'LOBBY' | 'LIVE' | 'REVEAL' | 'ENDED' | string;
  currentQuestionIndex: number;
  questionStartedAt?: string;
  questionEndsAt?: string;
  locked: boolean;
  endedAt?: string;
  revision?: number;
}

export interface QuizStudentQuestionDTO {
  id: string;
  subject?: string;
  grade?: string | null;
  chapter?: string;
  topic?: string;
  type: string;
  text: string;
  options?: string[];
  marks?: number;
}

export interface StudentQuizDTO {
  id: string;
  title: string;
  timePerQuestionSec?: number;
  totalMarks: number;
  questions: QuizStudentQuestionDTO[];
}

export interface LeaderboardEntryDTO {
  rank: number;
  displayName: string;
  score: number;
  isMe: boolean;
}

export interface StudentQuizSessionStateDTO {
  sessionId: string;
  sessionCode: string;
  quizId: string;
  quizTitle: string;
  status: 'LOBBY' | 'LIVE' | 'REVEAL' | 'ENDED' | string;
  revision: number;
  locked: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  timePerQuestionSec?: number;
  currentQuestion?: QuizStudentQuestionDTO;
  questionEndsAt?: string;
  secondsRemaining?: number;
  leaderboard?: LeaderboardEntryDTO[];
  myScore?: number;
  myRank?: number;
  myAnswer?: string;
  correctAnswer?: string;
  myCorrect?: boolean;
  myPointsAwarded?: number;
}

export interface TeacherParticipantDTO {
  studentId: string;
  displayName: string;
  score: number;
}

export interface TeacherQuizSessionStateDTO {
  sessionId: string;
  sessionCode: string;
  quizId: string;
  quizTitle: string;
  status: 'LOBBY' | 'LIVE' | 'REVEAL' | 'ENDED' | string;
  revision: number;
  locked: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  timePerQuestionSec?: number;
  currentQuestion?: QuizStudentQuestionDTO;
  correctAnswer?: string;
  questionEndsAt?: string;
  secondsRemaining?: number;
  participants?: TeacherParticipantDTO[];
  leaderboard?: LeaderboardEntryDTO[];
  answerDistribution?: Record<string, number>;
  totalResponses?: number;
}

export interface QuizAnswerResponse {
  accepted: boolean;
  correct: boolean;
  pointsAwarded: number;
  newScore: number;
}

export interface QuizQuestionStatDTO {
  questionIndex: number;
  questionId: string;
  text: string;
  totalResponses: number;
  correctResponses: number;
}

export interface QuizSessionReportDTO {
  sessionId: string;
  sessionCode: string;
  quizId: string;
  quizTitle: string;
  leaderboard: LeaderboardEntryDTO[];
  questionStats: QuizQuestionStatDTO[];
}

export interface QuizAttemptStartResponse {
  attemptId: string;
}
