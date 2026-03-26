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
  it('renders filters', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(''));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');
    
    render(<QuestionBankFilters subjects={['Math']} chapters={['Chapter 1']} />);
    
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('navigates when subject is clicked', () => {
    const mockPush = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(''));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');
    
    render(<QuestionBankFilters subjects={['Math']} chapters={['Chapter 1']} />);
    
    fireEvent.click(screen.getByText('Math'));
    
    // Changing subject shouldn't include chapter
    expect(mockPush).toHaveBeenCalledWith('/teacher/question-bank?subject=Math');
  });

  it('navigates when search input changes', () => {
    const mockPush = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('subject=Math'));
    vi.mocked(usePathname).mockReturnValue('/teacher/question-bank');
    
    render(<QuestionBankFilters subjects={['Math']} chapters={['Chapter 1']} />);
    
    fireEvent.change(screen.getByPlaceholderText('Search questions or topics...'), { target: { value: 'algebra' } });
    
    expect(mockPush).toHaveBeenCalledWith('/teacher/question-bank?subject=Math&q=algebra');
  });
});
