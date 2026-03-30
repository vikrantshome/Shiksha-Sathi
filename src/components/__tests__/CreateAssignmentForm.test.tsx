import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssignmentForm from '../CreateAssignmentForm';
import { Assignment, ClassItem } from '@/lib/api/types';

const { useAssignmentMock } = vi.hoisted(() => ({
  useAssignmentMock: vi.fn(),
}));

vi.mock('@/components/AssignmentContext', () => ({
  useAssignment: useAssignmentMock,
}));

vi.mock('@/lib/api', () => ({
  api: {
    assignments: {
      create: vi.fn(),
    },
  },
}));

import { api } from '@/lib/api';

describe('CreateAssignmentForm', () => {
  const mockRemoveQuestion = vi.fn();
  const mockClearSelection = vi.fn();
  const baseSelectedQuestions = [
    { id: 'q1', points: 1, text: 'Q1 text', type: 'MCQ' },
    { id: 'q2', points: 2, text: 'Q2 text', type: 'MCQ' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAssignmentMock.mockReturnValue({
      selectedQuestions: baseSelectedQuestions,
      removeQuestion: mockRemoveQuestion,
      clearSelection: mockClearSelection,
    });
    
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders empty state if no questions selected', () => {
    useAssignmentMock.mockReturnValue({
      selectedQuestions: [],
      removeQuestion: vi.fn(),
      clearSelection: vi.fn(),
    });
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' } as ClassItem]} />);
    expect(screen.getByText('No questions in the review tray yet')).toBeInTheDocument();
  });

  it('renders selected questions and form', () => {
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' } as ClassItem]} />);
    
    expect(screen.getByText('Selected Questions (2)')).toBeInTheDocument();
    expect(screen.getByText('Q1 text')).toBeInTheDocument();
    expect(screen.getByText('Total Marks')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // total marks
  });

  it('removes question when clicked', () => {
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' } as ClassItem]} />);
    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);
    expect(mockRemoveQuestion).toHaveBeenCalledWith('q1');
  });

  it('submits form and shows success screen', async () => {
    const createdAssignment: Assignment = {
      id: 'a1',
      title: 'Quiz 1',
      description: 'Assignment for class c1',
      subjectId: 'math',
      classId: 'c1',
      teacherId: 'teacher-1',
      questionIds: ['q1', 'q2'],
      dueDate: '2026-04-05',
      maxScore: 3,
      status: 'PUBLISHED',
      linkId: 'test-link',
      totalMarks: 3,
    };
    vi.mocked(api.assignments.create).mockResolvedValue(createdAssignment);

    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' } as ClassItem]} />);
    
    const titleInput = screen.getByPlaceholderText('e.g. Algebra & Linear Equations');
    fireEvent.change(titleInput, { target: { value: 'Quiz 1' } });
    
    const classSelect = screen.getByRole('combobox');
    fireEvent.change(classSelect, { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2026-04-05' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Finalize & Publish' }));

    await waitFor(() => {
      expect(api.assignments.create).toHaveBeenCalled();
    });

    expect(mockClearSelection).toHaveBeenCalled();
    expect(screen.getByText('Assignment Published')).toBeInTheDocument();
  });

  it('copies link to clipboard', async () => {
    const createdAssignment: Assignment = {
      id: 'a1',
      title: 'Quiz 1',
      description: 'Assignment for class c1',
      subjectId: 'math',
      classId: 'c1',
      teacherId: 'teacher-1',
      questionIds: ['q1', 'q2'],
      dueDate: '2026-04-05',
      maxScore: 3,
      status: 'PUBLISHED',
      linkId: 'test-link',
      totalMarks: 3,
    };
    vi.mocked(api.assignments.create).mockResolvedValue(createdAssignment);
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' } as ClassItem]} />);
    
    const titleInput = screen.getByPlaceholderText('e.g. Algebra & Linear Equations');
    fireEvent.change(titleInput, { target: { value: 'Quiz 1' } });
    const classSelect = screen.getByRole('combobox');
    fireEvent.change(classSelect, { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2026-04-05' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Finalize & Publish' }));
    await waitFor(() => expect(screen.getByText('Assignment Published')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Copy Link'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('test-link'));
  });
});
