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

    // Wait for the setTimeout callback to run
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(fetchApi).toHaveBeenCalledWith('/analytics/track', expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('"eventName":"class_created"')
    }));
  });

  it('fails gracefully when fetchApi throws error', async () => {
    vi.mocked(fetchApi).mockRejectedValue(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Main thread returns true
    const result = await trackEvent('assignment_published');
    expect(result).toBe(true);

    // Wait for setTimeout callback
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleSpy).toHaveBeenCalledWith('Telemetry tracking failed silently:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
