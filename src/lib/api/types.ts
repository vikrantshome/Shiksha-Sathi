export type Role = 'PARTNER' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role | string;
  schoolId?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  role: Role;
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
  studentCount: number;
  active: boolean;
  schoolId: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface ClassRequest {
  name: string;
  section: string;
  studentCount: number;
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
  dueDate: string;
  maxScore: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  linkId: string;
  totalMarks: number;
}

export interface AssignmentWithStats extends Assignment {
  className: string;
  submissionCount: number;
  averageScore: number;
  linkId: string;
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

export interface SubmitAssignmentResponse {
  success: boolean;
  score: number;
  totalMarks: number;
  feedback?: {
    questionId: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
    marksAwarded: number;
  }[];
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
