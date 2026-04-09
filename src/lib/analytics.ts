import { api } from './api';

/**
 * Fire-and-forget telemetry utility.
 * Sends analytics events without blocking the main UI thread.
 */
export function trackEvent(eventName: string, payload?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  setTimeout(() => {
    try {
      api.analytics.track(eventName, payload || {}).catch((e) => {
        console.debug('Telemetry tracking failed silently:', e);
      });
    } catch (error) {
      console.debug('Telemetry tracking failed silently:', error);
    }
  }, 0);
}
