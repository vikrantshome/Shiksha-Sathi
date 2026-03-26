import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | undefined;
  
  try {
    // Try to get from next/headers on the server
    const serverCookies = await cookies();
    token = serverCookies.get('auth-token')?.value;
  } catch {
    // Fallback to cookies-next on the client
    token = getCookie('auth-token') as string | undefined;
  }
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || 'An unexpected error occurred',
      status: response.status,
    };
  }

  return response.json();
}
