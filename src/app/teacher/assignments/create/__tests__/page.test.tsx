import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssignmentPage from '../page';
import { getDb } from '@/lib/mongodb';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

// Mock the child component to simplify
vi.mock('@/components/CreateAssignmentForm', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockCreateAssignmentForm({ classes }: any) {
    return <div data-testid="mock-form">{classes.length} classes</div>;
  }
}));

describe('CreateAssignmentPage', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { find: ReturnType<typeof vi.fn> };
  let mockCursor: { sort: ReturnType<typeof vi.fn> };
  let mockSortedCursor: { toArray: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSortedCursor = {
      toArray: vi.fn().mockResolvedValue([
        { _id: { toString: () => 'c1' }, name: 'Class 1', section: 'A' }
      ]),
    };
    mockCursor = {
      sort: vi.fn().mockReturnValue(mockSortedCursor),
    };
    mockCollection = {
      find: vi.fn().mockReturnValue(mockCursor),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    // @ts-expect-error test mock
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  it('renders page and passes classes to form', async () => {
    const Page = await CreateAssignmentPage();
    render(Page);
    
    expect(screen.getByText('Create Assignment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form')).toHaveTextContent('1 classes');
  });
});
