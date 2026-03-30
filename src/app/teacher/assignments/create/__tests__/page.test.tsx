import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssignmentPage from '../page';
import { ClassItem } from '@/lib/api/types';

vi.mock('@/lib/api', () => ({
  api: {
    classes: {
      getClasses: vi.fn(),
    },
  },
}));

// Mock the child component to simplify
vi.mock('@/components/CreateAssignmentForm', () => ({
  default: function MockCreateAssignmentForm({ classes }: { classes: ClassItem[] }) {
    return <div data-testid="mock-form">{classes.length} classes</div>;
  }
}));

import { api } from '@/lib/api';

describe('CreateAssignmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.classes.getClasses).mockResolvedValue([]);
  });

  it('renders page and passes classes to form', async () => {
    vi.mocked(api.classes.getClasses).mockResolvedValue([
      { id: 'c1', name: 'Class 1', section: 'A', active: true, studentCount: 30, schoolId: 's1', teacherIds: [], studentIds: [] }
    ]);

    const Page = await CreateAssignmentPage();
    render(Page);
    
    expect(screen.getByText('Finalize Your Assignment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form')).toHaveTextContent('1 classes');
  });
});
