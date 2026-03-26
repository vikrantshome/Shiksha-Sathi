import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishAssignmentAction } from '../assignments';
import { getDb } from '@/lib/mongodb';
import { Question } from '@/lib/questions';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

// Mock the analytics module explicitly since it's lazy loaded
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('publishAssignmentAction', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { insertOne: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection = {
      insertOne: vi.fn().mockResolvedValue({ insertedId: 'new-assignment-id' }),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    // @ts-expect-error test mock
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  const mockQuestions: Question[] = [
    { id: 'q1', marks: 1, text: 'Q1', type: 'MCQ', subject: 'Math', grade: '10', chapter: 'C', topic: 'T', correctAnswer: 'A' },
    { id: 'q2', marks: 2, text: 'Q2', type: 'MCQ', subject: 'Math', grade: '10', chapter: 'C', topic: 'T', correctAnswer: 'B' }
  ];

  it('throws an error if required fields are missing', async () => {
    const formData = new FormData();
    await expect(publishAssignmentAction(formData, mockQuestions)).rejects.toThrow('Missing required fields or no questions selected.');
  });

  it('throws an error if no questions selected', async () => {
    const formData = new FormData();
    formData.append('title', 'T');
    formData.append('classId', 'C');
    await expect(publishAssignmentAction(formData, [])).rejects.toThrow('Missing required fields or no questions selected.');
  });

  it('publishes assignment and generates link id', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Quiz');
    formData.append('classId', 'class-1');
    formData.append('dueDate', '2023-10-10');

    const result = await publishAssignmentAction(formData, mockQuestions);

    expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Quiz',
      classId: 'class-1',
      dueDate: '2023-10-10',
      totalMarks: 3,
      status: 'published',
    }));

    expect(result.success).toBe(true);
    expect(result.assignmentId).toBe('new-assignment-id');
    expect(result.linkId).toBeDefined();
  });
});
