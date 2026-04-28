import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Cookie check removed for tab-isolated auth
  // Auth is handled client-side via sessionStorage and server validates via Authorization header
  const pathname = request.nextUrl.pathname;

  // For now, allow all requests - client-side AuthSessionGuard handles protection
  // This enables tab-isolated logout behavior

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/login", "/signup"],
};
