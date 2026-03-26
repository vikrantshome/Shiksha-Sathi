import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssignmentForm from '../CreateAssignmentForm';
import { publishAssignmentAction } from '@/app/actions/assignments';

const { useAssignmentMock } = vi.hoisted(() => ({
  useAssignmentMock: vi.fn(),
}));

vi.mock('@/components/AssignmentContext', () => ({
  useAssignment: useAssignmentMock,
}));

vi.mock('@/app/actions/assignments', () => ({
  publishAssignmentAction: vi.fn()
}));

describe('CreateAssignmentForm', () => {
  const mockRemoveQuestion = vi.fn();
  const mockClearSelection = vi.fn();
  const baseSelectedQuestions = [
    { id: 'q1', marks: 1, text: 'Q1 text', type: 'MCQ' },
    { id: 'q2', marks: 2, text: 'Q2 text', type: 'MCQ' },
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
    useAssignmentMock.mockReturnValue({ selectedQuestions: [] });
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' }]} />);
    expect(screen.getByText("You haven't selected any questions yet.")).toBeInTheDocument();
  });

  it('renders selected questions and form', () => {
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' }]} />);
    
    expect(screen.getByText('Selected Questions (2)')).toBeInTheDocument();
    expect(screen.getByText('Q1 text')).toBeInTheDocument();
    expect(screen.getByText('Total Marks:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // total marks
  });

  it('removes question when clicked', () => {
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' }]} />);
    const removeBtns = screen.getAllByText('Remove');
    fireEvent.click(removeBtns[0]);
    expect(mockRemoveQuestion).toHaveBeenCalledWith('q1');
  });

  it('submits form and shows success screen', async () => {
    vi.mocked(publishAssignmentAction).mockResolvedValue({ success: true, linkId: 'test-link', assignmentId: 'a1' });

    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' }]} />);
    
    const titleInput = screen.getByPlaceholderText('e.g. Chapter 1 Quiz');
    fireEvent.change(titleInput, { target: { value: 'Quiz 1' } });
    
    // Select is found by label
    const classSelect = screen.getByRole('combobox');
    fireEvent.change(classSelect, { target: { value: 'c1' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Publish to Students' }));

    await waitFor(() => {
      expect(publishAssignmentAction).toHaveBeenCalled();
    });

    expect(mockClearSelection).toHaveBeenCalled();
    expect(screen.getByText('Assignment Published!')).toBeInTheDocument();
  });

  it('copies link to clipboard', async () => {
    vi.mocked(publishAssignmentAction).mockResolvedValue({ success: true, linkId: 'test-link', assignmentId: 'a1' });
    render(<CreateAssignmentForm classes={[{ id: 'c1', name: 'Math', section: 'A' }]} />);
    
    // Avoid submitting the actual form again by supplying a mocked action context
    // Actually simpler: just re-trigger success state via a mock component state, 
    // but React Testing Library needs user interaction.
    const titleInput = screen.getByPlaceholderText('e.g. Chapter 1 Quiz');
    fireEvent.change(titleInput, { target: { value: 'Quiz 1' } });
    const classSelect = screen.getByRole('combobox');
    fireEvent.change(classSelect, { target: { value: 'c1' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Publish to Students' }));
    await waitFor(() => expect(screen.getByText('Assignment Published!')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Copy Link'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('test-link'));
  });
});
