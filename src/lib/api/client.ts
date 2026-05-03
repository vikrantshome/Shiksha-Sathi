const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function getServerToken(): Promise<string | undefined> {
  return undefined;
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | undefined;

  if (typeof window === 'undefined') {
    token = await getServerToken();
  } else {
    token = sessionStorage.getItem('shiksha-sathi-token') ?? undefined;
  }

  const headers = new Headers(options.headers);
  // Never send an Authorization header to login/signup endpoints,
  // because a stale token causes the JWT filter to intercept the request
  // before it reaches the auth controller.
  const isAuthEndpoint = path === '/auth/login' || path === '/auth/signup';
  if (token && !isAuthEndpoint) {
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
