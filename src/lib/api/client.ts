import { getCookie } from 'cookies-next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | undefined;
  
  if (typeof window === 'undefined') {
    // Server-side: read from cookie (for SSR)
    try {
      token = getCookie('auth-token') as string | undefined;
    } catch {
      // Ignore if cookies not available
    }
  } else {
    // Client-side: read from sessionStorage for tab isolation
    token = sessionStorage.getItem('shiksha-sathi-token') ?? undefined;
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
    const message = errorData.message || errorData.error || 'An unexpected error occurred';
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}
