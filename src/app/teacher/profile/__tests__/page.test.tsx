import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from '../page';
import { getDb } from '@/lib/mongodb';
import { cookies } from 'next/headers';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock ProfileForm since it's a client component and tested separately
vi.mock('@/components/ProfileForm', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: function MockProfileForm({ initialData }: any) {
    return <div data-testid="profile-form">{JSON.stringify(initialData)}</div>;
  }
}));

describe('ProfilePage', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { findOne: ReturnType<typeof vi.fn> };
  let mockCookieStore: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCollection = {
      findOne: vi.fn(),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    // @ts-expect-error test mock
    vi.mocked(getDb).mockResolvedValue(mockDb);

    mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'session-id' }),
    };
    // @ts-expect-error test mock
    vi.mocked(cookies).mockResolvedValue(mockCookieStore);
  });

  it('renders ProfilePage with empty defaults if no profile found', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByText('Teacher Profile')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: '', school: '', board: '' }));
  });

  it('renders ProfilePage with fetched profile data', async () => {
    mockCollection.findOne.mockResolvedValue({
      name: 'Alice',
      school: 'Wonderland',
      board: 'ICSE',
    });

    const Page = await ProfilePage();
    render(Page);

    expect(screen.getByTestId('profile-form')).toHaveTextContent(JSON.stringify({ name: 'Alice', school: 'Wonderland', board: 'ICSE' }));
  });
});
