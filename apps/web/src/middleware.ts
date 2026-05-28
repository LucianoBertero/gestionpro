import { NextRequest, NextResponse } from 'next/server';

// This middleware runs on EVERY route. Since our auth is entirely client-side
// (Zustand store + HTTP-only cookies from Railway), we do NOT validate
// tokens here. AuthGuard.tsx handles all auth redirects on the client.
//
// If we need server-side auth in the future, add token validation here.
export function middleware(request: NextRequest) {
  // Let the request through. Client-side AuthGuard will handle redirects.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};