import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from '../page';
import { ProfileResponse } from '@/lib/api/types';

vi.mock('@/lib/api', () => ({
  api: {
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
    vi.mocked(api.teachers.getProfile).mockRejectedValue({ status: 404 });
  });

  it('renders ProfilePage with empty defaults if no profile found', async () => {
    vi.mocked(api.teachers.getProfile).mockRejectedValue({ status: 500 });

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText('Teacher Profile')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: '', school: '', board: 'CBSE' }));
  });

  it('renders ProfilePage with fetched profile data', async () => {
    vi.mocked(api.teachers.getProfile).mockResolvedValue({
      userId: 'teacher-1',
      name: 'Alice',
      school: 'Wonderland',
      board: 'ICSE',
    } as ProfileResponse);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: 'Alice', school: 'Wonderland', board: 'ICSE' }));
  });
});
