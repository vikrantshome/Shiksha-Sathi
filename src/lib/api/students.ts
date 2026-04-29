import { fetchApi } from './client';
import {
  StudentSubmissionSummary,
  StudentDashboardStats,
  StudentIdentity,
  SubmissionDTO,
  Assignment,
  User,
  Quiz,
  ClassItem,
} from './types';

const STORAGE_KEY = 'shiksha-sathi-student-identity';

/* ── Identity Persistence (localStorage) ── */

export function saveStudentIdentity(identity: StudentIdentity): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function getStudentIdentity(): StudentIdentity | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StudentIdentity;
  } catch {
    return null;
  }
}

export function clearStudentIdentity(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/* ── Enrichment Cache ── */

const assignmentCache = new Map<string, Assignment>();

async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  if (assignmentCache.has(assignmentId)) {
    return assignmentCache.get(assignmentId) || null;
  }
  try {
    const assignment = await fetchApi<Assignment>(`/assignments/${assignmentId}`, {
      method: 'GET',
    });
    assignmentCache.set(assignmentId, assignment);
    return assignment;
  } catch {
    return null;
  }
}

/* ── Student API Methods ── */

export const students = {
  /**
   * Fetch all submissions for a student by their studentId (roll number).
   * Enriches backend SubmissionDTO with assignment title/linkId/totalMarks.
   */
  getSubmissions: async (studentId: string): Promise<StudentSubmissionSummary[]> => {
    const submissions = await fetchApi<SubmissionDTO[]>(`/submissions/student/${studentId}`, {
      method: 'GET',
    });

    const enriched: StudentSubmissionSummary[] = [];

    for (const s of submissions) {
      // Fetch assignment details to get teacherName (the submission may not have it)
      let assignment = null;
      try {
        assignment = await getAssignment(s.assignmentId);
      } catch (e) {
        // Assignment fetch failed, continue without it
      }

      enriched.push({
        id: s.id,
        assignmentId: s.assignmentId,
        assignmentTitle: s.assignmentTitle || assignment?.title || 'Assignment',
        assignmentLinkId: s.assignmentLinkId || assignment?.linkId || '',
        teacherName: assignment?.teacherName || 'Teacher',
        studentName: s.studentName,
        studentRollNumber: s.studentRollNumber,
        score: s.score,
        totalMarks: s.totalMarks || assignment?.maxScore || assignment?.totalMarks || 0,
        submittedAt: s.submittedAt,
        status: s.status as 'SUBMITTED' | 'GRADED',
      });
    }

    return enriched;
  },

  /**
   * Compute dashboard stats from raw submissions.
   * The backend doesn't have a dedicated stats endpoint yet,
   * so we compute client-side from the full submission list.
   */
  getDashboardStats: async (studentId: string): Promise<StudentDashboardStats> => {
    const submissions = await students.getSubmissions(studentId);

    const graded = submissions.filter((s) => s.status === 'GRADED');
    const scorePercents = graded
      .filter((s) => s.totalMarks > 0)
      .map((s) => Math.round((s.score / s.totalMarks) * 100));

    const averageScorePercent =
      scorePercents.length > 0
        ? Math.round(scorePercents.reduce((a, b) => a + b, 0) / scorePercents.length)
        : 0;

    const bestScorePercent =
      scorePercents.length > 0 ? Math.max(...scorePercents) : 0;

    return {
      totalAssignments: submissions.length,
      submittedCount: submissions.length,
      gradedCount: graded.length,
      averageScorePercent,
      bestScorePercent,
      recentSubmissions: submissions.slice(0, 10),
    };
  },

  /**
   * Update the current student's profile.
   */
  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    studentClass?: string;
    section?: string;
    rollNumber?: string;
    school?: string;
  }): Promise<User> => {
    return fetchApi<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get classes the current student is enrolled in.
   */
  getEnrolledClasses: async (): Promise<ClassItem[]> => {
    return fetchApi<ClassItem[]>('/students/me/classes', {
      method: 'GET',
    });
  },

  /**
   * Get pending (not yet attempted) assignments for the current student.
   */
  getPendingAssignments: async (): Promise<Assignment[]> => {
    return fetchApi<Assignment[]>('/students/me/assignments/pending', {
      method: 'GET',
    });
  },

  /**
   * Get submitted assignments (with scores) for the current student.
   */
  getSubmittedAssignments: async (): Promise<SubmissionDTO[]> => {
    return fetchApi<SubmissionDTO[]>('/students/me/assignments/submitted', {
      method: 'GET',
    });
  },

  /**
   * Get pending (not yet attempted) quizzes for the current student.
   */
  getPendingQuizzes: async (): Promise<Quiz[]> => {
    return fetchApi<Quiz[]>('/students/me/quizzes/pending', {
      method: 'GET',
    });
  },

  /**
   * Get submitted quizzes (with scores) for the current student.
   */
  getSubmittedQuizzes: async (): Promise<any[]> => {
    return fetchApi<any[]>('/students/me/quizzes/submitted', {
      method: 'GET',
    });
  },
};
