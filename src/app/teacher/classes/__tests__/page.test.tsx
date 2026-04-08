import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClassesPage from '../page';
import { ClassItem } from '@/lib/api/types';

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
    vi.mocked(api.classes.getClasses).mockResolvedValue([]);
  });

  it('renders empty state when no classes exist', async () => {
    const Page = await ClassesPage();
    render(Page);
    
    expect(screen.getAllByText('Create Class').length).toBeGreaterThan(0);
    expect(screen.getByText('No active classes yet')).toBeInTheDocument();
  });

  it('renders list of classes', async () => {
    vi.mocked(api.classes.getClasses).mockResolvedValue([
      {
        id: 'class-1',
        name: 'Mathematics',
        section: 'A',
        grade: '10',
        active: true,
        schoolId: 'school-1',
        teacherIds: [],
        studentIds: [],
      }
    ] as ClassItem[]);

    const Page = await ClassesPage();
    render(Page);

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Class 10 • Section A')).toBeInTheDocument();
  });
});
