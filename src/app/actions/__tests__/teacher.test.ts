import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getAssignmentsWithStats, 
  getAssignmentReport,
  getDistinctSubjects,
  getDistinctChapters,
  getQuestions
} from '../teacher';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('Teacher Actions', () => {
  let mockDb: any;
  let mockAssignmentsCollection: any;
  let mockSubmissionsCollection: any;
  let mockClassesCollection: any;
  let mockQuestionsCollection: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAssignmentsCollection = {
      find: vi.fn(),
      findOne: vi.fn(),
    };

    mockSubmissionsCollection = {
      find: vi.fn(),
    };

    mockClassesCollection = {
      findOne: vi.fn(),
    };

    mockQuestionsCollection = {
      distinct: vi.fn(),
      find: vi.fn(),
    };

    mockDb = {
      collection: vi.fn((name) => {
        if (name === 'assignments') return mockAssignmentsCollection;
        if (name === 'submissions') return mockSubmissionsCollection;
        if (name === 'classes') return mockClassesCollection;
        if (name === 'questions') return mockQuestionsCollection;
        return { find: vi.fn(), findOne: vi.fn() };
      }),
    };

    (getDb as any).mockResolvedValue(mockDb);
  });

  describe('getAssignmentsWithStats', () => {
    it('returns empty array when no assignments exist', async () => {
      mockAssignmentsCollection.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([]),
      });

      const result = await getAssignmentsWithStats();
      expect(result).toEqual([]);
    });

    it('returns assignments with calculated stats', async () => {
      const assignmentId = new ObjectId();
      mockAssignmentsCollection.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([
          { _id: assignmentId, title: 'Test Assignment', totalMarks: 10, linkId: 'link-123', classId: new ObjectId().toString() }
        ]),
      });

      mockSubmissionsCollection.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          { score: 8 },
          { score: 10 }
        ]),
      });

      mockClassesCollection.findOne.mockResolvedValue({ name: 'Class 10', section: 'A' });

      const result = await getAssignmentsWithStats();
      expect(result).toHaveLength(1);
      expect(result[0].stats.completionCount).toBe(2);
      expect(result[0].stats.averageScore).toBe(9);
      expect(result[0].className).toBe('Class 10 (A)');
    });
  });

  describe('getAssignmentReport', () => {
    it('returns null if assignment not found', async () => {
      mockAssignmentsCollection.findOne.mockResolvedValue(null);
      
      const result = await getAssignmentReport(new ObjectId().toString());
      expect(result).toBeNull();
    });

    it('returns report with submission stats and question stats', async () => {
      const assignmentId = new ObjectId();
      mockAssignmentsCollection.findOne.mockResolvedValue({
        _id: assignmentId,
        title: 'Report Assignment',
        totalMarks: 10,
        linkId: 'link-abc',
        questions: [
          { id: 'q1', text: 'Q1', topic: 'Math', marks: 5 },
          { id: 'q2', text: 'Q2', topic: 'Science', marks: 5 }
        ]
      });

      mockSubmissionsCollection.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue([
          {
            _id: new ObjectId(),
            studentName: 'Alice',
            studentRollNumber: '1',
            score: 5,
            totalMarks: 10,
            answers: [
              { questionId: 'q1', isCorrect: true },
              { questionId: 'q2', isCorrect: false }
            ]
          },
          {
            _id: new ObjectId(),
            studentName: 'Bob',
            studentRollNumber: '2',
            score: 10,
            totalMarks: 10,
            answers: [
              { questionId: 'q1', isCorrect: true },
              { questionId: 'q2', isCorrect: true }
            ]
          }
        ]),
      });

      const result = await getAssignmentReport(assignmentId.toString());
      
      expect(result).not.toBeNull();
      expect(result?.submissions).toHaveLength(2);
      
      // Check question stats (q1 got 2/2 correct = 100%, q2 got 1/2 correct = 50%)
      expect(result?.questionStats).toHaveLength(2);
      expect(result?.questionStats[0].correctPercentage).toBe(100);
      expect(result?.questionStats[1].correctPercentage).toBe(50);
    });
  });

  describe('Questions Retrieval', () => {
    it('getDistinctSubjects calls distinct on db', async () => {
      mockQuestionsCollection.distinct.mockResolvedValue(['Math', 'Science']);
      const result = await getDistinctSubjects();
      expect(result).toEqual(['Math', 'Science']);
      expect(mockQuestionsCollection.distinct).toHaveBeenCalledWith('subject');
    });

    it('getDistinctChapters calls distinct with filter', async () => {
      mockQuestionsCollection.distinct.mockResolvedValue(['Algebra']);
      const result = await getDistinctChapters('Math');
      expect(result).toEqual(['Algebra']);
      expect(mockQuestionsCollection.distinct).toHaveBeenCalledWith('chapter', { subject: 'Math' });
    });

    it('getDistinctChapters returns empty array if subject is null', async () => {
      const result = await getDistinctChapters(null);
      expect(result).toEqual([]);
    });

    it('getQuestions filters by properties', async () => {
      mockQuestionsCollection.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          { id: 'q1', subject: 'Math', type: 'MCQ' }
        ])
      });

      const result = await getQuestions({ subject: 'Math', chapter: null, q: 'algebra', type: 'MCQ' });
      
      expect(result).toHaveLength(1);
      expect(mockQuestionsCollection.find).toHaveBeenCalledWith({
        subject: 'Math',
        type: 'MCQ',
        $or: [
          { text: { $regex: 'algebra', $options: 'i' } },
          { topic: { $regex: 'algebra', $options: 'i' } }
        ]
      });
    });
  });
});
