import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGIN_PATH = '/login';
const DEFAULT_REDIRECT = '/dashboard/overview';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has('refreshToken');

  // If on /login and already has a cookie, redirect to dashboard
  if (pathname === LOGIN_PATH && hasRefreshToken) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // Protect /dashboard/* routes: no cookie → redirect to /login
  if (pathname.startsWith('/dashboard') && !hasRefreshToken) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow all other paths through (/, /login without cookie, /api, public, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
