import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateAssignmentPage from '../page';

vi.mock('@/lib/api', () => ({
  api: {
    classes: {
      getClasses: vi.fn(),
    },
  },
}));

// Mock the child component to simplify
vi.mock('@/components/CreateAssignmentForm', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockCreateAssignmentForm({ classes }: any) {
    return <div data-testid="mock-form">{classes.length} classes</div>;
  }
}));

import { api } from '@/lib/api';

describe('CreateAssignmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.classes.getClasses).mockResolvedValue([] as any);
  });

  it('renders page and passes classes to form', async () => {
    vi.mocked(api.classes.getClasses).mockResolvedValue([
      { id: 'c1', name: 'Class 1', section: 'A', active: true, studentCount: 30, schoolId: 's1', teacherIds: [], studentIds: [] }
    ] as any);

    const Page = await CreateAssignmentPage();
    render(Page);
    
    expect(screen.getByText('Create Assignment')).toBeInTheDocument();
    expect(screen.getByTestId('mock-form')).toHaveTextContent('1 classes');
  });
});
