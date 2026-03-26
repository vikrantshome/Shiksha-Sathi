import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('next/server', () => {
  return {
    NextResponse: {
      redirect: vi.fn((url: string) => ({ status: 307, url })),
      next: vi.fn(() => ({ status: 200, url: 'next' })),
    },
    NextRequest: vi.fn(),
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createMockRequest(pathname: string, sessionCookie?: string) {
    const req = {
      nextUrl: { pathname },
      url: `http://localhost${pathname}`,
      cookies: {
        get: vi.fn().mockImplementation((name) => {
          if (name === 'session' && sessionCookie) {
            return { value: sessionCookie };
          }
          return undefined;
        }),
      },
    } as unknown as NextRequest;
    return req;
  }

  it('redirects unauthenticated users from /teacher routes to /login', () => {
    const req = createMockRequest('/teacher/dashboard');
    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', req.url));
  });

  it('allows authenticated users to access /teacher routes', () => {
    const req = createMockRequest('/teacher/dashboard', 'valid-session-id');
    const res = middleware(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('redirects authenticated users away from /login', () => {
    const req = createMockRequest('/login', 'valid-session-id');
    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/teacher/dashboard', req.url));
  });

  it('redirects authenticated users away from /signup', () => {
    const req = createMockRequest('/signup', 'valid-session-id');
    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/teacher/dashboard', req.url));
  });

  it('allows unauthenticated users to access /login', () => {
    const req = createMockRequest('/login');
    const res = middleware(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
