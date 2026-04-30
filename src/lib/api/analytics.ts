import { fetchApi } from './client';

export const analytics = {
  track: (eventName: string, payload: Record<string, unknown> = {}): Promise<void> =>
    fetchApi<void>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ eventName, payload }),
    }),
};
