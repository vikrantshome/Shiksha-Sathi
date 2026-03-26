import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClassesPage from '../page';
import { getDb } from '@/lib/mongodb';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

// Mock the actions so their imports do not cause issues during render
vi.mock('@/app/actions/classes', () => ({
  createClassAction: vi.fn(),
  deleteClassAction: vi.fn(),
  archiveClassAction: vi.fn(),
}));

describe('ClassesPage', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { find: ReturnType<typeof vi.fn> };
  let mockCursor: { sort: ReturnType<typeof vi.fn> };
  let mockSortedCursor: { toArray: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockSortedCursor = {
      toArray: vi.fn().mockResolvedValue([]),
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

  it('renders empty state when no classes exist', async () => {
    const Page = await ClassesPage();
    render(Page);
    
    expect(screen.getByText('Create New Class')).toBeInTheDocument();
    expect(screen.getByText('No active classes found. Create your first class to get started.')).toBeInTheDocument();
  });

  it('renders list of classes', async () => {
    mockSortedCursor.toArray.mockResolvedValue([
      {
        _id: { toString: () => 'class-1' },
        name: 'React 101',
        section: 'A',
        studentCount: 20,
        createdAt: '2023-01-01',
      }
    ]);

    const Page = await ClassesPage();
    render(Page);

    expect(screen.getByText('React 101')).toBeInTheDocument();
    expect(screen.getByText('Section A • 20 Students')).toBeInTheDocument();
  });
});
