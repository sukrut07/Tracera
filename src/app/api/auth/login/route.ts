import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser, getCurrentUser } from '@/lib/auth/session';
import { verifyFirebaseIdToken } from '@/lib/firebase/admin';
import { getUserByEmail } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, idToken } = body;

    let authenticatedEmail = email?.trim()?.toLowerCase();

    // If Firebase ID token is provided, verify it with Firebase Admin
    if (idToken) {
      const decodedToken = await verifyFirebaseIdToken(idToken);
      if (decodedToken && decodedToken.email) {
        authenticatedEmail = decodedToken.email.toLowerCase();
      }
    }

    if (!authenticatedEmail) {
      return NextResponse.json({ error: 'Work email is required' }, { status: 400 });
    }

    // Look up real TRACERA database profile
    const userProfile = getUserByEmail(authenticatedEmail);
    if (!userProfile) {
      return NextResponse.json(
        {
          error: 'Your account is authenticated, but no TRACERA workspace profile is configured. Contact your administrator.',
          code: 'PROFILE_MISSING',
        },
        { status: 404 }
      );
    }

    // Establish secure session
    await setSessionUser(authenticatedEmail);

    const redirectMap: Record<string, string> = {
      CLIENT: '/client/dashboard',
      AUDITOR: '/auditor/dashboard',
      PARTNER: '/partner/dashboard',
      ADMIN: '/admin/dashboard',
    };

    return NextResponse.json({
      success: true,
      user: userProfile,
      redirectTo: redirectMap[userProfile.role] || '/client/dashboard',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication service error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
