import { fetchApi } from './client';
import { ProfileResponse, ProfileRequest } from './types';

export const teachers = {
  getProfile: () =>
    fetchApi<ProfileResponse>('/teachers/profile', {
      method: 'GET',
    }),

  updateProfile: (data: ProfileRequest) =>
    fetchApi<ProfileResponse>('/teachers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
