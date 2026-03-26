import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestionBankPage from '../page';
import { getDistinctSubjects, getDistinctChapters, getQuestions } from '@/app/actions/teacher';

vi.mock('@/app/actions/teacher', () => ({
  getDistinctSubjects: vi.fn(),
  getDistinctChapters: vi.fn(),
  getQuestions: vi.fn(),
}));

// Mock components to simplify page testing
vi.mock('@/components/QuestionBankFilters', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockFilters({ subjects, chapters }: any) {
    return <div data-testid="mock-filters">{subjects.join(',')}|{chapters.join(',')}</div>;
  }
}));

vi.mock('@/components/QuestionCard', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockCard({ question }: any) {
    return <div data-testid="mock-card">{question.text}</div>;
  }
}));

describe('QuestionBankPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDistinctSubjects).mockResolvedValue(['Math', 'Science']);
    vi.mocked(getDistinctChapters).mockResolvedValue(['Algebra', 'Biology']);
    vi.mocked(getQuestions).mockResolvedValue([
      { id: 'q1', text: 'Test Math Q', subject: 'Math', chapter: 'Algebra', grade: '10', topic: 'X', type: 'MCQ', correctAnswer: 'A', marks: 1 }
    ]);
  });

  it('renders initial state without subject', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams = Promise.resolve({}) as any;
    const Page = await QuestionBankPage({ searchParams });
    render(Page);
    
    expect(screen.getByText('Select a subject from the left to start browsing.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toHaveTextContent('Math,Science|Algebra,Biology');
  });

  it('renders intermediate state with subject but no chapter', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams = Promise.resolve({ subject: 'Math' }) as any;
    const Page = await QuestionBankPage({ searchParams });
    render(Page);
    
    expect(screen.getByText('Select a chapter to view questions.')).toBeInTheDocument();
  });

  it('renders questions state when chapter is selected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams = Promise.resolve({ subject: 'Math', chapter: 'Algebra' }) as any;
    const Page = await QuestionBankPage({ searchParams });
    render(Page);
    
    expect(screen.getByText('Algebra Questions (1)')).toBeInTheDocument();
    expect(screen.getByTestId('mock-card')).toHaveTextContent('Test Math Q');
  });
});
