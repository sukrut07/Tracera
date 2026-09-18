import { NextRequest, NextResponse } from 'next/server';
import { setSessionUser, getCurrentUser } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await setSessionUser(email);
    if (!user) {
      return NextResponse.json({ error: 'User with provided email does not exist' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
      redirectTo: user.role === 'CLIENT' ? '/client/dashboard' : '/auditor/dashboard',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
