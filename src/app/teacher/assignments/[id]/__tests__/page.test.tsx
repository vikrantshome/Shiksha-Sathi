import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssignmentReportPage from '../page';
import { notFound } from 'next/navigation';

vi.mock('@/lib/api', () => ({
  api: {
    assignments: {
      getReport: vi.fn(),
    },
  },
}));

import { api } from '@/lib/api';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode, href: string }) => <a href={href}>{children}</a>,
}));

describe('AssignmentReportPage', () => {
  it('calls notFound when report is not found', async () => {
    vi.mocked(api.assignments.getReport).mockRejectedValueOnce(new Error('Not found'));
    vi.mocked(notFound).mockImplementation(() => { throw new Error('NOT_FOUND'); });

    await expect(async () => {
      await AssignmentReportPage({ params: Promise.resolve({ id: 'invalid-id' }) });
    }).rejects.toThrow('NOT_FOUND');
    
    expect(notFound).toHaveBeenCalled();
  });

  it('renders report details correctly', async () => {
    vi.mocked(api.assignments.getReport).mockResolvedValue({
      assignment: { 
        id: '123', 
        title: 'Math Test', 
        totalMarks: 20, 
        linkId: 'math-123',
        description: '',
        subjectId: '',
        classId: '',
        teacherId: '',
        questionIds: [],
        maxScore: 20,
        status: 'PUBLISHED',
        className: '',
        submissionCount: 2,
        averageScore: 15,
      },
      submissions: [
        { 
          id: 'sub1', 
          assignmentId: '123',
          studentId: 's1',
          studentName: 'Alice', 
          studentRollNumber: 'A1', 
          score: 18, 
          totalMarks: 20,
          submittedAt: '2024-01-01T00:00:00Z',
          status: 'SUBMITTED',
          answers: {} 
        },
        { 
          id: 'sub2',
          assignmentId: '123',
          studentId: 's2',
          studentName: 'Bob', 
          studentRollNumber: 'B1', 
          score: 12, 
          totalMarks: 20,
          submittedAt: '2024-01-01T00:00:00Z',
          status: 'SUBMITTED',
          answers: {} 
        },
      ],
      questionStats: [
        { 
          questionId: 'q1', 
          text: 'What is 2+2?', 
          topic: 'Addition', 
          marks: 10, 
          correctPercentage: 100 
        },
        { 
          questionId: 'q2', 
          text: 'Solve for x: x+5=10', 
          topic: 'Algebra', 
          marks: 10, 
          correctPercentage: 50 
        },
      ]
    } as any);

    const jsx = await AssignmentReportPage({ params: Promise.resolve({ id: '123' }) });
    render(jsx);

    expect(screen.getByText('Math Test')).toBeDefined();
    expect(screen.getByText('/student/assignment/math-123')).toBeDefined();
    
    expect(screen.getByText('Total Submissions')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('Average Score')).toBeDefined();
    expect(screen.getByText('15.0')).toBeDefined();
    
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('A1')).toBeDefined();
    expect(screen.getByText('18 / 20')).toBeDefined();
    
    expect(screen.getByText('Bob')).toBeDefined();
    expect(screen.getByText('B1')).toBeDefined();
    expect(screen.getByText('12 / 20')).toBeDefined();
    
    expect(screen.getByText('Q1. Addition')).toBeDefined();
    expect(screen.getByText('100% Correct')).toBeDefined();
    
    expect(screen.getByText('Q2. Algebra')).toBeDefined();
    expect(screen.getByText('50% Correct')).toBeDefined();
  });

  it('renders empty state when there are no submissions', async () => {
    vi.mocked(api.assignments.getReport).mockResolvedValue({
      assignment: { 
        id: '123', 
        title: 'Empty Test', 
        totalMarks: 10, 
        linkId: 'empty-123',
        description: '',
        subjectId: '',
        classId: '',
        teacherId: '',
        questionIds: [],
        maxScore: 10,
        status: 'PUBLISHED',
        className: '',
        submissionCount: 0,
        averageScore: 0,
      },
      submissions: [],
      questionStats: []
    } as any);

    const jsx = await AssignmentReportPage({ params: Promise.resolve({ id: '123' }) });
    render(jsx);

    expect(screen.getByText('Total Submissions')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
    expect(screen.getByText('No submissions yet.')).toBeDefined();
  });
});

