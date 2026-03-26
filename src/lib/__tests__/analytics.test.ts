import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent } from '../analytics';
import { fetchApi } from '../api/client';

vi.mock('../api/client', () => ({
  fetchApi: vi.fn(),
}));

describe('Analytics trackEvent', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchApi).mockResolvedValue({ success: true });
  });

  it('tracks event successfully without blocking', async () => {
    // Await trackEvent, which returns true immediately
    const result = await trackEvent('class_created', { classId: '456' });
    
    expect(result).toBe(true);
    
    // Wait for the async IIFE to run
    await new Promise(process.nextTick);
    
    expect(fetchApi).toHaveBeenCalledWith('/analytics/track', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"event":"class_created"')
    }));
  });

  it('fails gracefully when fetchApi throws error', async () => {
    vi.mocked(fetchApi).mockRejectedValue(new Error('Network error'));
    
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
