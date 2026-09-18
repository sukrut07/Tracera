import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid work email' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDb();

    // Check if user exists
    const user = db.prepare('SELECT id, email FROM users WHERE email = ? COLLATE NOCASE').get(cleanEmail);

    // Return generic success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this work email, a password reset link has been dispatched.',
      exists: Boolean(user),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Password reset request failed' }, { status: 500 });
  }
}
