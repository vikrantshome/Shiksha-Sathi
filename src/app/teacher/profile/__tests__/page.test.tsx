import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from '../page';
import { ProfileResponse, User } from '@/lib/api/types';

vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      getMe: vi.fn(),
    },
    teachers: {
      getProfile: vi.fn(),
    },
  },
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('REDIRECT'); }),
}));

// Mock ProfileForm since it's a client component and tested separately
vi.mock('@/components/ProfileForm', () => ({
  default: function MockProfileForm({
    initialData,
  }: {
    initialData: { name?: string; school?: string; board?: string } | null;
  }) {
    return <div data-testid="profile-form">{JSON.stringify(initialData)}</div>;
  }
}));

import { api } from '@/lib/api';

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.auth.getMe).mockResolvedValue({
      id: 'teacher-1',
      name: 'Test Teacher',
      email: 'test@example.com',
      role: 'TEACHER',
    } as User);
    vi.mocked(api.teachers.getProfile).mockRejectedValue({ status: 404 });
  });

  it('renders ProfilePage with empty defaults if no profile found', async () => {
    vi.mocked(api.teachers.getProfile).mockRejectedValue({ status: 500 });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
    });
    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: 'Test Teacher', school: '', board: 'CBSE' }));
  });

  it('renders ProfilePage with fetched profile data', async () => {
    vi.mocked(api.teachers.getProfile).mockResolvedValue({
      userId: 'teacher-1',
      name: 'Alice',
      school: 'Wonderland',
      board: 'ICSE',
    } as ProfileResponse);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: 'Alice', school: 'Wonderland', board: 'ICSE' }));
    });
  });
});
