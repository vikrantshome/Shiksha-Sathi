import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClassAction, deleteClassAction, archiveClassAction } from '../classes';
import { getDb } from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock the analytics module explicitly since it's lazy loaded
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('Classes Actions', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { insertOne: ReturnType<typeof vi.fn>; deleteOne: ReturnType<typeof vi.fn>; updateOne: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCollection = {
      insertOne: vi.fn(),
      deleteOne: vi.fn(),
      updateOne: vi.fn(),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    // @ts-expect-error Mock implementation
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe('createClassAction', () => {
    it('throws error if required fields are missing', async () => {
      const formData = new FormData();
      await expect(createClassAction(formData)).rejects.toThrow('Missing required fields');
    });

    it('creates class and revalidates path on success', async () => {
      const formData = new FormData();
      formData.append('name', 'Math 101');
      formData.append('section', 'A');
      formData.append('studentCount', '30');

      await createClassAction(formData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Math 101',
        section: 'A',
        studentCount: 30,
        archived: false,
      }));
      expect(revalidatePath).toHaveBeenCalledWith('/teacher/classes');
    });
  });

  describe('deleteClassAction', () => {
    it('deletes class and revalidates path', async () => {
      const id = '507f1f77bcf86cd799439011';
      await deleteClassAction(id);
      
      expect(mockCollection.deleteOne).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/teacher/classes');
    });
  });

  describe('archiveClassAction', () => {
    it('archives class and revalidates path', async () => {
      const id = '507f1f77bcf86cd799439011';
      await archiveClassAction(id);
      
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        { $set: { archived: true } }
      );
      expect(revalidatePath).toHaveBeenCalledWith('/teacher/classes');
    });
  });
});
