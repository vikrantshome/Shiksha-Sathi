import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authToken = request.cookies.get("auth-token");
  const pathname = request.nextUrl.pathname;

  // Protect /teacher routes
  if (pathname.startsWith("/teacher")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect /student routes (except assignment link access and login page)
  if (pathname.startsWith("/student") && !pathname.startsWith("/student/assignment/") && pathname !== "/student/login") {
    if (!authToken) {
      return NextResponse.redirect(new URL("/student/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/login", "/signup"],
};
