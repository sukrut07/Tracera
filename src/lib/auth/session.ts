import { cookies } from 'next/headers';
import { getDb, getUserByEmail, getUserById } from '@/lib/db';
import { Role, UserProfile } from '@/types';
import { randomBytes } from 'crypto';

// Fixed typo: trecera → tracera
export const SESSION_COOKIE_NAME = 'tracera_session_id';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Creates a new opaque session for the given email.
 * The session cookie contains a random 256-bit value, not the user's email
 * or role. Identity is resolved against the durable sessions table.
 */
export async function setSessionUser(email: string): Promise<UserProfile | null> {
  const user = getUserByEmail(email);
  if (!user) return null;

  const sessionId = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const db = getDb();

  // Opportunistic cleanup keeps the table bounded without a background job.
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now.toISOString());
  db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, user.id, expiresAt.toISOString(), now.toISOString());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    maxAge: SESSION_TTL_MS / 1000,
  });
  cookieStore.set('tracera_role_hint', user.role, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    maxAge: SESSION_TTL_MS / 1000,
  });

  return user;
}

/**
 * Resolves the current user from the opaque session cookie.
 * Returns null if session is missing, expired, or invalid.
 * The cookie value is never trusted as an identity itself.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) return null;

    const db = getDb();
    const session = db.prepare(`
      SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?
    `).get(sessionId, new Date().toISOString()) as { user_id: string } | undefined;
    if (!session) {
      try {
        cookieStore.delete(SESSION_COOKIE_NAME);
        cookieStore.delete('tracera_role_hint');
      } catch {
        // Ignored if in read-only context
      }
      return null;
    }

    // Resolve the actual user from DB every time (ensures deactivated accounts are rejected)
    const user = getUserById(session.user_id);
    if (!user) {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
      try {
        cookieStore.delete(SESSION_COOKIE_NAME);
        cookieStore.delete('tracera_role_hint');
      } catch {
        // Ignored if in read-only context
      }
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Clears the current session cookie and invalidates the server-side session.
 */
export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (sessionId) {
      getDb().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete('tracera_role_hint');
  } catch {
    // best-effort
  }
}

/**
 * Requires an authenticated session. Throws 401 if not authenticated.
 */
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw Object.assign(new Error('Authentication required. Please sign in.'), { status: 401 });
  }
  return user;
}

/**
 * Requires the authenticated user to have one of the specified roles.
 * Throws 403 if the user does not have an authorized role.
 */
export async function requireRole(allowedRoles: Role[]): Promise<UserProfile> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw Object.assign(
      new Error(`Access denied. Your role (${user.role}) is not authorized for this operation.`),
      { status: 403 }
    );
  }
  return user;
}

/**
 * Validates that the authenticated user has access to a specific engagement.
 * ADMIN has access to all engagements.
 * PARTNER has access to all firm engagements.
 * AUDITOR has access if assigned to the engagement or unassigned review pool.
 * CLIENT has access ONLY if engagement.client_id === user.client_id.
 */
export async function requireEngagementAccess(user: UserProfile, engagementId: string): Promise<void> {
  if (user.role === 'ADMIN' || user.role === 'PARTNER') return;
  const db = getDb();
  const eng = db.prepare('SELECT client_id, assigned_staff_id, assigned_manager_id, assigned_partner_id FROM engagements WHERE id = ?').get(engagementId) as
    | { client_id: string; assigned_staff_id: string | null; assigned_manager_id: string | null; assigned_partner_id: string | null }
    | undefined;
  if (!eng) {
    throw Object.assign(new Error('Engagement not found.'), { status: 404 });
  }
  if (user.role === 'CLIENT') {
    if (eng.client_id !== user.client_id) {
      throw Object.assign(new Error('Access denied: You do not own this engagement.'), { status: 403 });
    }
    return;
  }
  if (user.role === 'AUDITOR') {
    // Staff/auditors can view assignments or team work
    const isAssigned =
      eng.assigned_staff_id === user.id ||
      eng.assigned_manager_id === user.id ||
      eng.assigned_partner_id === user.id;
    if (!isAssigned) {
      // Allow if auditor is assigned to the client
      const client = db.prepare('SELECT assigned_auditor FROM clients WHERE id = ?').get(eng.client_id) as { assigned_auditor: string | null } | undefined;
      if (client?.assigned_auditor !== user.id) {
        throw Object.assign(new Error('Access denied: You are not assigned to this engagement.'), { status: 403 });
      }
    }
  }
}

/**
 * Validates that the authenticated user has access to a specific document.
 * CLIENT can only access their own client organization documents.
 * AUDITOR can only access assigned documents or documents in their assigned engagements/clients.
 */
export async function requireDocumentAccess(user: UserProfile, documentId: string): Promise<void> {
  if (user.role === 'ADMIN' || user.role === 'PARTNER') return;
  const db = getDb();
  const doc = db.prepare('SELECT client_id, assigned_to FROM documents WHERE id = ?').get(documentId) as
    | { client_id: string; assigned_to: string | null }
    | undefined;
  if (!doc) {
    throw Object.assign(new Error('Document not found.'), { status: 404 });
  }
  if (user.role === 'CLIENT') {
    if (doc.client_id !== user.client_id) {
      throw Object.assign(new Error('Access denied: You do not have permission to view this document.'), { status: 403 });
    }
    return;
  }
  if (user.role === 'AUDITOR') {
    if (doc.assigned_to && doc.assigned_to !== user.id) {
      const client = db.prepare('SELECT assigned_auditor FROM clients WHERE id = ?').get(doc.client_id) as { assigned_auditor: string | null } | undefined;
      if (client?.assigned_auditor !== user.id) {
        throw Object.assign(new Error('Access denied: You are not assigned to review this document.'), { status: 403 });
      }
    }
  }
}

/**
 * Creates a standardized 401 or 403 JSON response from an auth error.
 */
export function authErrorResponse(err: unknown) {
  const status = typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
    ? (err as { status: number }).status
    : 401;
  const message = err instanceof Error ? err.message : 'Unauthorized';
  return { error: message, status };
}
