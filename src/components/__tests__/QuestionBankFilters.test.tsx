import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionBankFilters from '../QuestionBankFilters';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

describe('QuestionBankFilters', () => {
  it('renders filters with board, class, subject flow', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(''));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['Board1', 'Board2']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    expect(screen.getByText('Boards')).toBeInTheDocument();
    expect(screen.getByText('Board1')).toBeInTheDocument();
  });

  it('navigates when board is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(''));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['Board1', 'Board2']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    fireEvent.click(screen.getByText('Board1'));

    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates when class is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=Board1'));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['Board1', 'Board2']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    fireEvent.click(screen.getByText('6'));

    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates when subject is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=Board1&class=6'));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['Board1', 'Board2']} classes={['6', '7']} subjects={['Math', 'Science']} books={['Book1']} chapters={['Chapter 1']} />);

    fireEvent.click(screen.getByText('Math'));

    expect(mockPush).toHaveBeenCalled();
  });

  it('navigates when search input changes', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=Board1&class=6&subject=Math'));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['Board1', 'Board2']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    fireEvent.change(screen.getByPlaceholderText('Search questions or topics...'), { target: { value: 'algebra' } });

    expect(mockPush).toHaveBeenCalled();
  });
});
