import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from '../page';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockProfileForm({ initialData }: any) {
    return <div data-testid="profile-form">{JSON.stringify(initialData)}</div>;
  }
}));

import { api } from '@/lib/api';

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.teachers.getProfile).mockResolvedValue(null as any);
  });

  it('renders ProfilePage with empty defaults if no profile found', async () => {
    vi.mocked(api.teachers.getProfile).mockRejectedValue({ status: 500 });

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText('Teacher Profile')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: '', school: '', board: '' }));
  });

  it('renders ProfilePage with fetched profile data', async () => {
    vi.mocked(api.teachers.getProfile).mockResolvedValue({
      name: 'Alice',
      school: 'Wonderland',
      board: 'ICSE',
    } as any);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: 'Alice', school: 'Wonderland', board: 'ICSE' }));
  });
});
