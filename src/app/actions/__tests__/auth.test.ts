import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction, signupAction, logoutAction } from '../auth';
import { getDb } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

vi.mock('@/lib/mongodb', () => ({
  getDb: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Auth Actions', () => {
  let mockDb: { collection: ReturnType<typeof vi.fn> };
  let mockCollection: { findOne: ReturnType<typeof vi.fn>; insertOne: ReturnType<typeof vi.fn> };
  let mockCookieStore: { set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCollection = {
      findOne: vi.fn(),
      insertOne: vi.fn(),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb);

    mockCookieStore = {
      set: vi.fn(),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as ReturnType<typeof cookies>);
  });

  describe('loginAction', () => {
    it('throws error if email or password missing', async () => {
      const formData = new FormData();
      await expect(loginAction(formData)).rejects.toThrow('Email and password are required');
    });

    it('throws error for invalid credentials', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpass');
      
      mockCollection.findOne.mockResolvedValue(null);

      await expect(loginAction(formData)).rejects.toThrow('Invalid email or password');
    });

    it('sets cookie and redirects on successful login', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'correctpass');
      
      const mockTeacher = { _id: 'teacher-123' };
      mockCollection.findOne.mockResolvedValue(mockTeacher);

      await loginAction(formData);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'session',
        'teacher-123',
        expect.objectContaining({ path: '/', httpOnly: true })
      );
      expect(redirect).toHaveBeenCalledWith('/teacher/dashboard');
    });
  });

  describe('signupAction', () => {
    it('throws error if fields missing', async () => {
      const formData = new FormData();
      await expect(signupAction(formData)).rejects.toThrow('Name, email, and password are required');
    });

    it('throws error if email already registered', async () => {
      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'test@example.com');
      formData.append('password', 'pass123');

      mockCollection.findOne.mockResolvedValue({ _id: 'existing-user' });

      await expect(signupAction(formData)).rejects.toThrow('Email already registered');
    });

    it('creates user, sets cookie and redirects on success', async () => {
      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'test@example.com');
      formData.append('password', 'pass123');

      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({ insertedId: 'new-teacher-123' });

      await signupAction(formData);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'pass123',
      }));
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'session',
        'new-teacher-123',
        expect.objectContaining({ path: '/', httpOnly: true })
      );
      expect(redirect).toHaveBeenCalledWith('/teacher/dashboard');
    });
  });

  describe('logoutAction', () => {
    it('deletes session cookie and redirects', async () => {
      await logoutAction();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});
