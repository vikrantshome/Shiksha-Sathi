import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssignmentByLinkId, submitAssignmentAction } from '../student';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('student actions', () => {
  let mockDb: any;
  let mockAssignments: any;
  let mockSubmissions: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup collections
    mockAssignments = {
      findOne: vi.fn(),
    };
    mockSubmissions = {
      findOne: vi.fn(),
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'new-sub-id' }),
    };

    mockDb = {
      collection: vi.fn((name) => {
        if (name === 'assignments') return mockAssignments;
        if (name === 'submissions') return mockSubmissions;
        return { findOne: vi.fn() };
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe('getAssignmentByLinkId', () => {
    it('returns null if assignment not found', async () => {
      mockAssignments.findOne.mockResolvedValue(null);
      const result = await getAssignmentByLinkId('invalid-link');
      expect(result).toBeNull();
    });

    it('returns sanitized assignment and tracks event', async () => {
      const mockAssignment = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        title: 'Science Quiz',
        classId: 'class1',
        dueDate: '2023-12-01',
        totalMarks: 10,
        linkId: 'valid-link',
        questions: [
          {
            id: 'q1',
            text: 'What is H2O?',
            type: 'SHORT_ANSWER',
            marks: 5,
            correctAnswer: 'Water',
          },
        ],
      };
      
      mockAssignments.findOne.mockResolvedValue(mockAssignment);
      
      const result = await getAssignmentByLinkId('valid-link');
      
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Science Quiz');
      expect(result?.id).toBe('507f1f77bcf86cd799439011');
      // Assert that correctAnswer was stripped
      expect(result?.questions[0]).not.toHaveProperty('correctAnswer');
      expect(result?.questions[0].text).toBe('What is H2O?');
    });
  });

  describe('submitAssignmentAction', () => {
    const mockAssignmentId = '507f1f77bcf86cd799439011';
    const mockStudent = { name: 'Alice', rollNumber: 'A01' };

    it('throws error if duplicate submission', async () => {
      mockSubmissions.findOne.mockResolvedValue({ _id: 'existing-sub' });
      
      await expect(submitAssignmentAction(mockAssignmentId, mockStudent, {}))
        .rejects.toThrow('You have already submitted this assignment.');
        
      expect(mockSubmissions.findOne).toHaveBeenCalledWith({
        assignmentId: mockAssignmentId,
        studentRollNumber: 'A01'
      });
    });

    it('throws error if assignment not found', async () => {
      mockSubmissions.findOne.mockResolvedValue(null);
      mockAssignments.findOne.mockResolvedValue(null);
      
      await expect(submitAssignmentAction(mockAssignmentId, mockStudent, {}))
        .rejects.toThrow('Assignment not found');
    });

    it('grades correctly and inserts submission', async () => {
      mockSubmissions.findOne.mockResolvedValue(null);
      mockAssignments.findOne.mockResolvedValue({
        _id: new ObjectId(mockAssignmentId),
        title: 'Quiz',
        totalMarks: 20,
        questions: [
          { id: 'q1', text: '1+1', correctAnswer: '2', marks: 5 },
          { id: 'q2', text: 'Capital of France', correctAnswer: ['Paris'], marks: 10 },
          { id: 'q3', text: 'Wrong answer test', correctAnswer: 'True', marks: 5 }
        ]
      });

      const answers = {
        'q1': '2', // Exact match
        'q2': 'paris ', // Case insensitive with space
        'q3': 'False', // Incorrect
      };

      const result = await submitAssignmentAction(mockAssignmentId, mockStudent, answers);
      
      expect(result.success).toBe(true);
      expect(result.score).toBe(15); // 5 + 10
      expect(result.totalMarks).toBe(20);
      
      expect(mockSubmissions.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        assignmentId: mockAssignmentId,
        studentName: 'Alice',
        studentRollNumber: 'A01',
        score: 15,
        totalMarks: 20,
        answers: expect.arrayContaining([
          expect.objectContaining({ questionId: 'q1', isCorrect: true, marksAwarded: 5 }),
          expect.objectContaining({ questionId: 'q2', isCorrect: true, marksAwarded: 10 }),
          expect.objectContaining({ questionId: 'q3', isCorrect: false, marksAwarded: 0 }),
        ])
      }));
    });
  });
});
