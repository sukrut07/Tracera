import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { setSessionUser } from '@/lib/auth/session';
import { randomUUID } from 'crypto';
import { connectToDatabase, isMongoConfigured } from '@/lib/mongodb/connection';
import { User } from '@/lib/mongodb/models';
import { hashPassword } from '@/lib/auth/password';
import { isFirebaseAdminConfigured, verifyFirebaseIdToken } from '@/lib/firebase/admin';

import { Role } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, organization, phone, idToken, role } = body;

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

    // When Firebase is configured, bind the workspace account only to a
    // verified Firebase identity. Never accept a Firebase UID from the body.
    let firebaseUid: string | null = null;
    if (isFirebaseAdminConfigured) {
      if (!idToken) {
        return NextResponse.json({ error: 'Authentication token is required.' }, { status: 401 });
      }
      const decoded = await verifyFirebaseIdToken(idToken);
      if (!decoded?.email || decoded.email.toLowerCase() !== cleanEmail) {
        return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 });
      }
      firebaseUid = decoded.uid;
    }

    const db = getDb();

    // 1. Check if user already exists
    const existing = db.prepare('SELECT id, email, role FROM users WHERE email = ? COLLATE NOCASE').get(cleanEmail) as { id: string } | undefined;
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 2. Allow CLIENT, AUDITOR, or PARTNER registration (defaults to CLIENT)
    const allowedRoles: Role[] = ['CLIENT', 'AUDITOR', 'PARTNER'];
    const assignedRole: Role = (role && allowedRoles.includes(role)) ? role : 'CLIENT';
    const userId = randomUUID();
    const clientId = assignedRole === 'CLIENT' ? randomUUID() : null;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    // 3. Create the role profile atomically.
    db.transaction(() => {
      if (clientId) {
        db.prepare(`
          INSERT INTO clients (id, name, email, company_name, financial_year, phone, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(clientId, cleanName, cleanEmail, cleanOrg || cleanName, '2026-27', cleanPhone, now, now);
      }

      db.prepare(`
        INSERT INTO users (id, name, email, role, client_id, organization, phone, firebase_uid, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, cleanName, cleanEmail, assignedRole, clientId, cleanOrg || (assignedRole === 'CLIENT' ? cleanName : 'TRACERA Practice Firm'), cleanPhone, firebaseUid, passwordHash, now);
    })();

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
        JSON.stringify({ email: cleanEmail, organization: cleanOrg, role: assignedRole, method: firebaseUid ? 'FIREBASE' : 'PASSWORD' }),
        now
      );
    } catch (auditErr) {
      console.warn('Registration audit log notice:', auditErr);
    }

    // 6. Establish server session
    const userProfile = await setSessionUser(cleanEmail);

    const redirectMap: Record<Role, string> = {
      CLIENT: '/client/dashboard',
      AUDITOR: '/auditor/dashboard',
      PARTNER: '/partner/dashboard',
      ADMIN: '/admin/dashboard',
    };

    return NextResponse.json({
      success: true,
      user: userProfile,
      redirectTo: redirectMap[assignedRole] || '/client/dashboard',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    const status = error?.status || 500;
    return NextResponse.json(
      { error: error.message || 'Registration failed. Please try again.' },
      { status }
    );
  }
}
