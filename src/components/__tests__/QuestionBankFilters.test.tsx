import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionBankFilters, { QuestionBankSearch } from '../QuestionBankFilters';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

describe('QuestionBankFilters', () => {
  const chapters = [
    { chapterNumber: 1, chapterTitle: 'Rational Numbers', label: 'Chapter 1: Rational Numbers', count: 10 },
  ];

  it('renders board selector', () => {
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn(), replace: vi.fn() } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={chapters} />);

    expect(screen.getAllByText('Board Select')[0]).toBeInTheDocument();
    expect(screen.getAllByText('NCERT / CBSE')[0]).toBeInTheDocument();
  });

  it('renders class selection buttons', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, replace: vi.fn() } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={chapters} />);

    expect(screen.getByText('Class (6-12)')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('navigates when class is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, replace: vi.fn() } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={chapters} />);

    fireEvent.click(screen.getByText('6'));

    expect(mockPush).toHaveBeenCalled();
  });

  it('renders subject selection', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, replace: vi.fn() } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT&class=6') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math', 'Science']} books={['Book1']} chapters={chapters} />);

    expect(screen.getAllByText('Subject')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Math')[0]).toBeInTheDocument();
  });

  it('navigates when search input changes', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, replace: vi.fn() } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT&class=6&subject=Math') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankSearch />);

    fireEvent.change(screen.getByPlaceholderText('Search by topic, keyword or chapter...'), { target: { value: 'algebra' } });

    expect(mockPush).toHaveBeenCalled();
  });

  it('rewrites legacy chapter params to canonical chapterNumber and chapterTitle', async () => {
    const mockReplace = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: vi.fn(), replace: mockReplace } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams('board=NCERT&class=8&subject=Math&chapter=Chapter+1%3A+Rational+Numbers') as unknown as ReturnType<typeof useSearchParams>
    );
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['NCERT']} classes={['8']} subjects={['Math']} books={['Book1']} chapters={chapters} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/teacher/question-bank?board=NCERT&class=8&subject=Math&chapterNumber=1&chapterTitle=Rational+Numbers'
      );
    });
  });
});
