const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | undefined;

  if (typeof window !== 'undefined') {
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
    let errorData: any = {};
    const contentType = response.headers.get('content-type') || '';
    
    // Always try to read body - first as JSON, then as text
    if (contentType.toLowerCase().includes('application/json')) {
      errorData = await response.json().catch(async () => {
        // If JSON parse fails, try reading as text
        const text = await response.text().catch(() => '');
        return { error: text || response.statusText };
      });
    } else {
      // For non-JSON responses (like HTML error pages), read as text
      const text = await response.text().catch(() => '');
      errorData = { error: text || response.statusText };
    }
    
    // Extract message from various possible response formats
    const message = errorData.message 
      || errorData.error 
      || (typeof errorData === 'string' ? errorData : null)
      || response.statusText 
      || `Server error (${response.status})`;
      
    const error = new Error(message) as Error & { status?: number; response?: any };
    error.status = response.status;
    error.response = errorData;
    
    if (response.status === 401 && typeof window !== 'undefined') {
      sessionStorage.removeItem('shiksha-sathi-token');
      window.location.href = '/login';
    }
    throw error;
  }

  return response.json();
}
