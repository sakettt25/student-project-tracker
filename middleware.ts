import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simple middleware for demo purposes
  // In a real app, you'd check for valid authentication tokens

  const { pathname } = request.nextUrl

  // Protect faculty and student routes
  if (pathname.startsWith("/faculty") || pathname.startsWith("/student")) {
    // In a real app, check for authentication here
    // For demo, we'll allow all requests
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/faculty/:path*", "/student/:path*"],
}
