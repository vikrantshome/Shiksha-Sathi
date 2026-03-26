import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent } from '../analytics';
import { getDb } from '../mongodb';

vi.mock('../mongodb', () => ({
  getDb: vi.fn(),
}));

describe('Analytics trackEvent', () => {
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCollection = {
      insertOne: vi.fn().mockResolvedValue({ insertedId: '123' }),
    };
    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  it('tracks event successfully without blocking', async () => {
    // Await trackEvent, which returns true immediately
    const result = await trackEvent('class_created', { classId: '456' });
    
    expect(result).toBe(true);
    expect(getDb).toHaveBeenCalled();
    
    // Wait for the async IIFE to run
    await new Promise(process.nextTick);
    
    expect(mockDb.collection).toHaveBeenCalledWith('analytics_events');
    expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      event: 'class_created',
      payload: { classId: '456' },
      userAgent: 'server',
      timestamp: expect.any(String)
    }));
  });

  it('fails gracefully when getDb throws error', async () => {
    vi.mocked(getDb).mockRejectedValue(new Error('DB connection failed'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await trackEvent('teacher_signup');
    
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Analytics initialization error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handles insertion errors silently in background', async () => {
    mockCollection.insertOne.mockRejectedValue(new Error('Insertion failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Main thread returns true
    const result = await trackEvent('assignment_published');
    expect(result).toBe(true); 
    
    // Wait for async IIFE
    await new Promise(process.nextTick);
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to track event:', 'assignment_published', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
