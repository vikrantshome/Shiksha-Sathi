import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestionBankPage from '../page';

vi.mock('@/lib/api', () => ({
  api: {
    questions: {
      getBoards: vi.fn(),
      getClasses: vi.fn(),
      getSubjects: vi.fn(),
      getBooks: vi.fn(),
      getChapters: vi.fn(),
      search: vi.fn(),
    },
  },
}));

import { api } from '@/lib/api';

// Mock components to simplify page testing
vi.mock('@/components/QuestionBankFilters', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockFilters({ boards, classes, subjects, books, chapters }: any) {
    return <div data-testid="mock-filters">{boards?.join(',') || ''}|{classes?.join(',') || ''}|{subjects.join(',')}|{books?.join(',') || ''}|{chapters.join(',')}</div>;
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
    vi.mocked(api.questions.getBoards).mockResolvedValue(['NCERT'] as any);
    vi.mocked(api.questions.getClasses).mockResolvedValue(['6', '7', '8', '9', '10', '11', '12'] as any);
    vi.mocked(api.questions.getSubjects).mockResolvedValue(['Mathematics', 'Science', 'English'] as any);
    vi.mocked(api.questions.getBooks).mockResolvedValue(['Curiosity', 'Ganita Prakash'] as any);
    vi.mocked(api.questions.getChapters).mockResolvedValue(['Chapter 1: Sets', 'Chapter 2: Relations'] as any);
    vi.mocked(api.questions.search).mockResolvedValue([
      { id: 'q1', text: 'Test Math Q', subject_id: 'Mathematics', chapter: 'Chapter 1: Sets', provenance: { board: 'NCERT', class: '11', book: 'Ganita Prakash' }, type: 'MCQ', correctAnswer: 'A', points: 1 }
    ] as any);
  });

  it('renders initial state without board selected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams = Promise.resolve({}) as any;
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Select a board from the left to start browsing.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toHaveTextContent('NCERT|6,7,8,9,10,11,12|Mathematics,Science,English');
  });

  it('renders intermediate state with board but no class', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams = Promise.resolve({ board: 'NCERT' }) as any;
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Select a class to continue.')).toBeInTheDocument();
  });

  it('renders questions state when chapter is selected', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchParams = Promise.resolve({ board: 'NCERT', class: '11', subject: 'Mathematics', book: 'Ganita Prakash', chapter: 'Chapter 1: Sets' }) as any;
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Chapter 1: Sets Results (1)')).toBeInTheDocument();
    expect(screen.getByTestId('mock-card')).toHaveTextContent('Test Math Q');
  });
});


