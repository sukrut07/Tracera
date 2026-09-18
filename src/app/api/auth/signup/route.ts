import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { setSessionUser } from '@/lib/auth/session';
import { randomUUID } from 'crypto';
import { connectToDatabase, isMongoConfigured } from '@/lib/mongodb/connection';
import { User } from '@/lib/mongodb/models';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, organization, phone, firebaseUid } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid work email is required' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanOrg = organization?.trim() || null;
    const cleanPhone = phone?.trim() || null;

    const db = getDb();

    // 1. Check if user already exists
    const existing = db.prepare('SELECT id, email, role FROM users WHERE email = ? COLLATE NOCASE').get(cleanEmail) as { id: string } | undefined;
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 2. Safe Role Assignment: Public sign-ups are always CLIENT role
    const assignedRole = 'CLIENT';
    const userId = randomUUID();
    const now = new Date().toISOString();

    // 3. Insert into SQLite
    try {
      db.prepare(`
        INSERT INTO users (id, name, email, role, client_id, organization, phone, firebase_uid, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, cleanName, cleanEmail, assignedRole, null, cleanOrg, cleanPhone, firebaseUid || null, now);
    } catch {
      db.prepare(`
        INSERT INTO users (id, name, email, role, client_id, organization, phone, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, cleanName, cleanEmail, assignedRole, null, cleanOrg, cleanPhone, now);
    }

    // 4. Mirror to MongoDB if configured
    if (isMongoConfigured) {
      try {
        await connectToDatabase();
        await User.create({
          firebaseUid: firebaseUid || undefined,
          name: cleanName,
          email: cleanEmail,
          role: assignedRole,
          organization: cleanOrg || undefined,
          phone: cleanPhone || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (mongoErr) {
        console.warn('MongoDB user sync notice (non-fatal):', mongoErr);
      }
    }

    // 5. Audit trail registration event
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        cleanName,
        assignedRole,
        'USER_REGISTERED',
        JSON.stringify({ email: cleanEmail, organization: cleanOrg, method: firebaseUid ? 'FIREBASE' : 'PASSWORD' }),
        now
      );
    } catch (auditErr) {
      console.warn('Registration audit log notice:', auditErr);
    }

    // 6. Establish server session
    const userProfile = await setSessionUser(cleanEmail);

    return NextResponse.json({
      success: true,
      user: userProfile,
      redirectTo: '/client/dashboard',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
