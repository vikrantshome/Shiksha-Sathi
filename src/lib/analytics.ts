import { api } from './api';

/**
 * Fire-and-forget telemetry utility.
 * Sends analytics events without blocking the main UI thread.
 */
export function trackEvent(eventName: string, payload?: Record<string, unknown>): boolean {
  if (typeof window === 'undefined') return true;

  setTimeout(() => {
    try {
      api.analytics.track(eventName, payload || {}).catch((e: Error) => {
        console.debug('Telemetry tracking failed silently:', e);
      });
    } catch (error) {
      console.debug('Telemetry tracking failed silently:', error);
    }
  }, 0);

  return true;
}
