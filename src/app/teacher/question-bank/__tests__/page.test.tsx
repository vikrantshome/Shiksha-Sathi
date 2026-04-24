import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QuestionBankPage from '../page';
import { Question } from '@/lib/api/types';

vi.mock('@/lib/api', () => ({
  api: {
    questions: {
      getBoards: vi.fn(),
      getClasses: vi.fn(),
      getSubjects: vi.fn(),
      getBooks: vi.fn(),
      getChapters: vi.fn(),
      getChaptersMeta: vi.fn(),
      search: vi.fn(),
    },
  },
}));

import { api } from '@/lib/api';

// Mock components to simplify page testing
vi.mock('@/components/QuestionBankFilters', () => ({
  default: function MockFilters({
    boards,
    classes,
    subjects,
    books,
    chapters,
  }: {
    boards?: string[];
    classes?: string[];
    subjects: string[];
    books?: string[];
    chapters: string[];
  }) {
    return <div data-testid="mock-filters">{boards?.join(',') || ''}|{classes?.join(',') || ''}|{subjects.join(',')}|{books?.join(',') || ''}|{chapters.join(',')}</div>;
  },
  QuestionBankSearch: function MockQuestionBankSearch() {
    return <div data-testid="mock-search">Search</div>;
  },
}));

vi.mock('@/components/QuestionCard', () => ({
  default: function MockCard({ question }: { question: Question }) {
    return <div data-testid="mock-card">{question.text}</div>;
  }
}));

vi.mock('@/components/AssignmentTray', () => ({
  default: function MockAssignmentTray() {
    return <div data-testid="mock-assignment-tray">Tray</div>;
  },
}));

describe('QuestionBankPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.questions.getBoards).mockResolvedValue(['NCERT']);
    vi.mocked(api.questions.getClasses).mockResolvedValue(['6', '7', '8', '9', '10', '11', '12']);
    vi.mocked(api.questions.getSubjects).mockResolvedValue(['Mathematics', 'Science', 'English']);
    vi.mocked(api.questions.getBooks).mockResolvedValue(['Curiosity', 'Ganita Prakash']);
    vi.mocked(api.questions.getChapters).mockResolvedValue(['Chapter 1: Sets', 'Chapter 2: Relations']);
    vi.mocked(api.questions.getChaptersMeta).mockResolvedValue([{ title: 'Chapter 1: Sets', sequence: 1 }]);
    vi.mocked(api.questions.search).mockResolvedValue([
      {
        id: 'q1',
        subjectId: 'Mathematics',
        chapter: 'Chapter 1: Sets',
        topic: 'Sets',
        text: 'Test Math Q',
        type: 'MCQ',
        correctAnswer: 'A',
        points: 1,
      },
    ]);
  });

  it('renders initial state without board selected', async () => {
    const searchParams = Promise.resolve({});
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Select a board from the left to start browsing.')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toHaveTextContent('NCERT|6,7,8,9,10,11,12|Mathematics,Science,English');
    expect(api.questions.getSubjects).toHaveBeenCalledWith({
      board: undefined,
      classLevel: undefined,
    });
  });

  it('renders intermediate state with board but no class', async () => {
    const searchParams = Promise.resolve({ board: 'NCERT' });
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Select a class to continue.')).toBeInTheDocument();
    expect(api.questions.getSubjects).toHaveBeenCalledWith({
      board: 'NCERT',
      classLevel: undefined,
    });
  });

  it('renders questions state when chapter is selected', async () => {
    const searchParams = Promise.resolve({ board: 'NCERT', class: '11', subject: 'Mathematics', book: 'Ganita Prakash', chapter: 'Chapter 1: Sets' });
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Question Repository')).toBeInTheDocument();
    expect(screen.getByText(/Browsing chapter-specific questions for/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-card')).toHaveTextContent('Test Math Q');
  });

  it('ignores invalid subject params that do not belong to the selected class', async () => {
    vi.mocked(api.questions.getSubjects).mockResolvedValue(['Science', 'Mathematics']);

    const searchParams = Promise.resolve({
      board: 'NCERT',
      class: '7',
      subject: 'Biology',
    });
    const Page = await QuestionBankPage({ searchParams });
    render(Page);

    expect(screen.getByText('Choose a Subject')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toHaveTextContent('Science,Mathematics');
    expect(screen.queryByText(/Biology/)).not.toBeInTheDocument();
    expect(api.questions.search).not.toHaveBeenCalled();
  });
});
