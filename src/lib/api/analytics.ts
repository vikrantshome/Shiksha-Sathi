import { fetchApi } from './client';

export const analytics = {
  track: (event: string, payload: Record<string, any> = {}): Promise<void> =>
    fetchApi<void>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, payload }),
    }),
};
