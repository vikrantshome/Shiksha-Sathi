import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClassesPage from '../page';

vi.mock('@/lib/api', () => ({
  api: {
    classes: {
      getClasses: vi.fn(),
      createClass: vi.fn(),
      archiveClass: vi.fn(),
      deleteClass: vi.fn(),
    },
  },
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('REDIRECT'); }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { api } from '@/lib/api';

describe('ClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.classes.getClasses).mockResolvedValue([] as any);
  });

  it('renders empty state when no classes exist', async () => {
    const Page = await ClassesPage();
    render(Page);
    
    expect(screen.getByText('Create New Class')).toBeInTheDocument();
    expect(screen.getByText('No active classes found. Create your first class to get started.')).toBeInTheDocument();
  });

  it('renders list of classes', async () => {
    vi.mocked(api.classes.getClasses).mockResolvedValue([
      {
        id: 'class-1',
        name: 'React 101',
        section: 'A',
        studentCount: 20,
        active: true,
        schoolId: 'school-1',
        teacherIds: [],
        studentIds: [],
      }
    ] as any);

    const Page = await ClassesPage();
    render(Page);

    expect(screen.getByText('React 101')).toBeInTheDocument();
    expect(screen.getByText('Section A • 20 Students')).toBeInTheDocument();
  });
});



