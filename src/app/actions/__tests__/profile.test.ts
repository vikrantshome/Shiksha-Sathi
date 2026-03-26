import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfileAction } from '../profile';
import { getDb } from '@/lib/mongodb';
import { cookies } from 'next/headers';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Profile Actions', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { updateOne: ReturnType<typeof vi.fn> };
  let mockCookieStore: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCollection = {
      updateOne: vi.fn(),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    // @ts-expect-error Mock implementation
    vi.mocked(getDb).mockResolvedValue(mockDb);

    mockCookieStore = {
      get: vi.fn(),
    };
    // @ts-expect-error Mock implementation
    vi.mocked(cookies).mockResolvedValue(mockCookieStore);
  });

  describe('updateProfileAction', () => {
    it('throws error if unauthorized (no session)', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const formData = new FormData();
      await expect(updateProfileAction(formData)).rejects.toThrow('Unauthorized');
    });

    it('updates profile and returns success', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'session-id' });
      const formData = new FormData();
      formData.append('name', 'Jane Doe');
      formData.append('school', 'NGA');
      formData.append('board', 'CBSE');

      const result = await updateProfileAction(formData);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { session: 'session-id' },
        { $set: { name: 'Jane Doe', school: 'NGA', board: 'CBSE' } },
        { upsert: true }
      );
      expect(result).toEqual({ success: true });
    });
  });
});
