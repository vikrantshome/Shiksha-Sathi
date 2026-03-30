import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionBankFilters, { QuestionBankSearch } from '../QuestionBankFilters';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

describe('QuestionBankFilters', () => {
  it('renders board selector', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    expect(screen.getByText('Board Select')).toBeInTheDocument();
    expect(screen.getByText('NCERT / CBSE')).toBeInTheDocument();
  });

  it('renders class selection buttons', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    expect(screen.getByText('Class (6-12)')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('navigates when class is clicked', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math']} books={['Book1']} chapters={['Chapter 1']} />);

    fireEvent.click(screen.getByText('6'));

    expect(mockPush).toHaveBeenCalled();
  });

  it('renders subject selection', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT&class=6') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankFilters boards={['State Board', 'CBSE']} classes={['6', '7']} subjects={['Math', 'Science']} books={['Book1']} chapters={['Chapter 1']} />);

    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('navigates when search input changes', () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('board=NCERT&class=6&subject=Math') as unknown as ReturnType<typeof useSearchParams>);
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');

    render(<QuestionBankSearch />);

    fireEvent.change(screen.getByPlaceholderText('Search by topic, keyword or chapter...'), { target: { value: 'algebra' } });

    expect(mockPush).toHaveBeenCalled();
  });
});
