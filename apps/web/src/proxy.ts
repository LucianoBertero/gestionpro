import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple proxy: let all requests through. Auth is fully client-side via AuthGuard.
// We do NOT check cookies here because:
// 1. Next.js edge runtime can't reliably read httpOnly cookies from Railway
// 2. The auth flow (login → store → redirect) is entirely client-side
// 3. AuthGuard.tsx handles all auth redirects on the client

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
