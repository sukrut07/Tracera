import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const user = await requireRole(['ADMIN', 'PARTNER']);
    const db = getDb();
    const users = db.prepare(`SELECT id, name, email, role, client_id, organization, phone, created_at FROM users ORDER BY created_at DESC`).all();
    return NextResponse.json({ users, currentUser: user });
  } catch (error: any) {
    const s = error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed' }, { status: s });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['ADMIN']);
    const { name, email, role, clientId, organization, phone } = await req.json();
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'name, email, role are required' }, { status: 400 });
    }
    const validRoles = ['CLIENT', 'AUDITOR', 'PARTNER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    const now = new Date().toISOString();
    const userId = randomUUID();
    try {
      db.prepare(`INSERT INTO users (id, name, email, role, client_id, organization, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(userId, name.trim(), email.trim().toLowerCase(), role, clientId || null, organization?.trim() || null, phone?.trim() || null, now);
    } catch {
      db.prepare(`INSERT INTO users (id, name, email, role, client_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(userId, name.trim(), email.trim().toLowerCase(), role, clientId || null, now);
    }
    try {
      db.prepare(`INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(randomUUID(), user.id, user.name, user.role, 'USER_CREATED', JSON.stringify({ new_user_name: name, new_user_email: email, new_user_role: role }), now);
    } catch { /* safe */ }
    const newUser = db.prepare('SELECT id, name, email, role, client_id, organization, phone, created_at FROM users WHERE id = ?').get(userId);
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    const s = error.message?.includes('Unauthorized') ? 401 : error.message?.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed' }, { status: s });
  }
}
