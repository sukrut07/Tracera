import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'tracera_session_id';
const PROTECTED_PREFIXES = ['/client', '/auditor', '/partner', '/admin', '/engagements', '/documents'];
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !sessionId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/auditor/:path*',
    '/partner/:path*',
    '/admin/:path*',
    '/engagements/:path*',
    '/documents/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
};
