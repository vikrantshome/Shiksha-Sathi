import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth is handled client-side via sessionStorage.
  // Server validates via Authorization header.
  // Client-side AuthSessionGuard handles route protection.

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/login", "/signup"],
};
