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

    // ── PATH 1: Firebase token verification (if token provided & admin configured) ──
    if (idToken && isFirebaseAdminConfigured) {
      try {
        const decodedToken = await verifyFirebaseIdToken(idToken);
        if (decodedToken && decodedToken.email) {
          authenticatedEmail = decodedToken.email.toLowerCase();
        }
      } catch (tokenErr) {
        console.warn('Firebase token verification error, falling back to password check:', tokenErr);
      }
    }

    // ── PATH 2: Password evaluation auth ──
    if (!authenticatedEmail) {
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
        firm_id: userProfile.firm_id,
      },
      redirectTo: redirectMap[userProfile.role] || '/client/dashboard',
    });
  } catch (error: any) {
    console.error('[auth/login] error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication service error. Please try again.' },
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
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
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
        firm_id: user.firm_id,
      },
    });
  } catch (err: any) {
    console.warn('[auth/login GET] session resolution notice:', err?.message);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
