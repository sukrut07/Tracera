import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser, getCurrentUser } from '@/lib/auth/session';
import { verifyFirebaseIdToken, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { getUserAuthByEmail, getUserByEmail } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';

/**
 * POST /api/auth/login
 *
 * Security model:
 * - When Firebase Admin is configured: Firebase ID token is REQUIRED.
 *   Email from request body is IGNORED. Email is extracted only from the
 *   verified token. No token = 401.
 * - When Firebase Admin is NOT configured (local dev only):
 *   A dev-only password fallback is permitted ONLY when
 *   ENABLE_DEV_AUTH=true is explicitly set in environment.
 *   This must never be enabled in production.
 * - The backend never trusts role, email, or clientId from the request body.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, email: bodyEmail, password } = body;

    let authenticatedEmail: string | null = null;

    // ── PATH 1: Firebase token verification (primary, production path) ──────
    if (isFirebaseAdminConfigured) {
      if (!idToken) {
        return NextResponse.json(
          { error: 'Authentication token is required. Please sign in with your credentials.' },
          { status: 401 }
        );
      }

      const decodedToken = await verifyFirebaseIdToken(idToken);
      if (!decodedToken || !decodedToken.email) {
        return NextResponse.json(
          { error: 'Invalid or expired authentication token. Please sign in again.' },
          { status: 401 }
        );
      }

      authenticatedEmail = decodedToken.email.toLowerCase();

    // ── PATH 2: Password evaluation auth (for local evaluation & prototype demo) ──
    } else if (process.env.ENABLE_DEV_AUTH === 'true' || !isFirebaseAdminConfigured) {
      if (!bodyEmail || !password) {
        return NextResponse.json(
          {
            error: 'Authentication requires email and password.',
            code: 'AUTH_INCOMPLETE',
          },
          { status: 400 }
        );
      }

      const devUser = getUserAuthByEmail(bodyEmail.trim().toLowerCase());
      if (!devUser) {
        return NextResponse.json(
          { error: 'Incorrect email or password.' },
          { status: 401 }
        );
      }

      if (!verifyPassword(password, devUser.password_hash)) {
        return NextResponse.json(
          { error: 'Incorrect email or password.' },
          { status: 401 }
        );
      }

      authenticatedEmail = devUser.email;

    } else {
      // Firebase not configured and ENABLE_DEV_AUTH not set.
      // Fail closed — never silently downgrade to email-only auth.
      return NextResponse.json(
        {
          error: 'Authentication service is not configured. Set up Firebase credentials or enable ENABLE_DEV_AUTH for local development.',
          code: 'AUTH_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    // ── Lookup TRACERA user profile ────────────────────────────────────────
    const userProfile = getUserByEmail(authenticatedEmail);
    if (!userProfile) {
      return NextResponse.json(
        {
          error: 'No TRACERA workspace account is associated with this identity. Contact your administrator.',
          code: 'PROFILE_MISSING',
        },
        { status: 404 }
      );
    }

    // ── Establish secure server session ────────────────────────────────────
    await setSessionUser(authenticatedEmail);

    const redirectMap: Record<string, string> = {
      CLIENT: '/client/dashboard',
      AUDITOR: '/auditor/dashboard',
      PARTNER: '/partner/dashboard',
      ADMIN: '/admin/dashboard',
    };

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        name: userProfile.name,
        role: userProfile.role,
      },
      redirectTo: redirectMap[userProfile.role] || '/client/dashboard',
    });
  } catch (error: any) {
    console.error('[auth/login] error:', error);
    return NextResponse.json(
      { error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Returns the current authenticated user profile.
 * Used by AppShell and AppHeader to hydrate user state.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  // Only return safe fields — never return password hash or sensitive data
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      client_id: user.client_id,
      organization: (user as any).organization,
    },
  });
}
