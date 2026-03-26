import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionCard from '../QuestionCard';
import { Question } from '@/lib/questions';

const mockToggleQuestion = vi.fn();
const mockIsSelected = vi.fn().mockReturnValue(false);

// Add mock for AssignmentContext
vi.mock('../AssignmentContext', () => ({
  useAssignment: () => ({
    toggleQuestion: mockToggleQuestion,
    isSelected: mockIsSelected,
  }),
}));

import { useAssignment } from '../AssignmentContext';

describe('QuestionCard', () => {
  const mockQuestion: Question = {
    id: 'q1',
    subject: 'Math',
    grade: 'Grade 10',
    chapter: 'Polynomials',
    topic: 'Zeroes',
    type: 'MCQ',
    text: 'What is 2+2?',
    options: ['3', '4', '5'],
    correctAnswer: '4',
    marks: 1,
  };

  it('renders correctly', () => {
    render(<QuestionCard question={mockQuestion} />);
    
    expect(screen.getByText('Zeroes')).toBeInTheDocument();
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('A. 3')).toBeInTheDocument();
    expect(screen.getByText('B. 4')).toBeInTheDocument();
  });

  it('toggles preview', () => {
    render(<QuestionCard question={mockQuestion} />);
    
    expect(screen.queryByText('Teacher Preview')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Preview Question'));
    
    expect(screen.getByText('Teacher Preview')).toBeInTheDocument();
    expect(screen.getByText('Correct Answer:')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Hide Preview'));
    expect(screen.queryByText('Teacher Preview')).not.toBeInTheDocument();
  });

  it('calls toggleQuestion when adding to assignment', () => {
    render(<QuestionCard question={mockQuestion} />);
    
    fireEvent.click(screen.getByText('Add to Assignment'));
    
    expect(mockToggleQuestion).toHaveBeenCalledWith(mockQuestion);
  });
});
