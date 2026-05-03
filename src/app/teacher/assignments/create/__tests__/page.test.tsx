import { render, screen, waitFor } from '@testing-library/react';
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

vi.mock('@/components/Loader', () => ({
  default: function MockLoader({ label }: { label?: string }) {
    return <div data-testid="mock-loader">{label || 'Loading...'}</div>;
  }
}));

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
      { id: 'c1', name: 'Class 1', section: 'A', grade: '10', active: true, schoolId: 's1', teacherIds: [], studentIds: [] }
    ]);

    render(<CreateAssignmentPage />);

    await waitFor(() => {
      expect(screen.getByText('Finalize Your Assignment')).toBeInTheDocument();
    });
    expect(screen.getByTestId('mock-form')).toHaveTextContent('1 classes');
  });

  it('shows loading state initially', () => {
    vi.mocked(api.classes.getClasses).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<CreateAssignmentPage />);

    expect(screen.getByTestId('mock-loader')).toBeInTheDocument();
  });

  it('shows error state on failure', async () => {
    vi.mocked(api.classes.getClasses).mockRejectedValue(new Error('Network error'));

    render(<CreateAssignmentPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
