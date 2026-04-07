import { fetchApi } from './client';

export interface School {
  id: string;
  name: string;
  city?: string;
  state?: string;
  active: boolean;
}

export const schools = {
  /**
   * Search schools by name (case-insensitive, partial match).
   * Returns up to 5 matching schools.
   */
  search: (query: string): Promise<School[]> =>
    fetchApi<School[]>(`/schools/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    }),
};
