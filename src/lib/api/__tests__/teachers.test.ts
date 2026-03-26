import { describe, it, expect, vi, beforeEach } from 'vitest';
import { teachers } from '../teachers';
import { fetchApi } from '../client';

vi.mock('../client', () => ({
  fetchApi: vi.fn(),
}));

describe('teachers API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProfile calls the correct endpoint', async () => {
    const mockProfile = { userId: '123', name: 'John', school: 'S1', board: 'B1' };
    vi.mocked(fetchApi).mockResolvedValue(mockProfile);

    const result = await teachers.getProfile();

    expect(fetchApi).toHaveBeenCalledWith('/teachers/profile', {
      method: 'GET',
    });
    expect(result).toEqual(mockProfile);
  });

  it('updateProfile calls the correct endpoint with data', async () => {
    const profileData = { name: 'John', school: 'S1', board: 'B1' };
    vi.mocked(fetchApi).mockResolvedValue({ userId: '123', ...profileData });

    const result = await teachers.updateProfile(profileData);

    expect(fetchApi).toHaveBeenCalledWith('/teachers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    expect(result.name).toBe('John');
  });
});
