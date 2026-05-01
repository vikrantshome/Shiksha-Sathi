import { fetchApi } from './api/client';

/**
 * Fire-and-forget telemetry utility.
 * Sends analytics events without blocking the main UI thread.
 */
export function trackEvent(eventName: string, payload?: Record<string, unknown>): boolean {
  if (typeof window === 'undefined') return true;

  setTimeout(() => {
    try {
      fetchApi<void>('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ eventName, payload }),
      }).catch((e: Error) => {
        console.debug('Telemetry tracking failed silently:', e);
      });
    } catch (error) {
      console.debug('Telemetry tracking failed silently:', error);
    }
  }, 0);

  return true;
}
