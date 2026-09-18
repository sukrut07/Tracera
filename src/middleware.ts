import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/client', '/auditor', '/partner', '/admin', '/engagements', '/documents'];
const AUTH_PAGES = ['/login', '/signup', '/forgot-password'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const userCookie = req.cookies.get('trecera_session_user')?.value;
  const roleCookie = req.cookies.get('trecera_session_role')?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));

  // 1. Unauthenticated user trying to access protected workspace routes
  if (isProtected && !userCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting /login, /signup or /forgot-password
  if (isAuthPage && userCookie && roleCookie) {
    const roleRedirects: Record<string, string> = {
      CLIENT: '/client/dashboard',
      AUDITOR: '/auditor/dashboard',
      PARTNER: '/partner/dashboard',
      ADMIN: '/admin/dashboard',
    };
    const target = roleRedirects[roleCookie] || '/client/dashboard';
    return NextResponse.redirect(new URL(target, req.url));
  }

  // 3. Role-based Route Authorization Protection
  if (isProtected && roleCookie) {
    // Client trying to access Auditor, Partner, or Admin views
    if (roleCookie === 'CLIENT') {
      if (
        pathname.startsWith('/auditor') ||
        pathname.startsWith('/partner') ||
        pathname.startsWith('/admin')
      ) {
        return NextResponse.redirect(new URL('/client/dashboard', req.url));
      }
    }

    // Auditor trying to access Admin view
    if (roleCookie === 'AUDITOR') {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/auditor/dashboard', req.url));
      }
    }

    // Partner trying to access Admin view
    if (roleCookie === 'PARTNER') {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/partner/dashboard', req.url));
      }
    }
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
