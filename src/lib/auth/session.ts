import { cookies } from 'next/headers';
import { getDb, getUserByEmail, getUserById } from '@/lib/db';
import { Role, UserProfile } from '@/types';
import { createHmac, randomBytes } from 'crypto';

// Fixed typo: trecera → tracera
export const SESSION_COOKIE_NAME = 'tracera_session_id';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_SECRET = process.env.SESSION_SECRET || 'tracera-audit-workflow-master-key-2025';

export type SessionUser = UserProfile & { sessionId: string };

/**
 * Generates an HMAC-signed session token.
 * Contains userId and expiration timestamp so any serverless instance can
 * verify authentication without sharing an in-memory or ephemeral SQLite database.
 */
export function generateSessionToken(userId: string, expiresAt: Date): string {
  const expiresAtMs = expiresAt.getTime();
  const entropy = randomBytes(16).toString('base64url');
  const payload = `${userId}.${expiresAtMs}.${entropy}`;
  const signature = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies an HMAC-signed session token.
 * Returns the userId and expiration timestamp if valid and not expired.
 */
export function verifySessionToken(token: string): { userId: string; expiresAtMs: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 4) return null;
    const [userId, expiresAtMsStr, entropy, signature] = parts;
    const payload = `${userId}.${expiresAtMsStr}.${entropy}`;
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (signature !== expectedSig) return null;

    const expiresAtMs = Number(expiresAtMsStr);
    if (isNaN(expiresAtMs) || expiresAtMs <= Date.now()) return null;

    return { userId, expiresAtMs };
  } catch {
    return null;
  }
}

/**
 * Creates a new resilient session for the given email.
 * Both persists to the local database sessions table AND returns an HMAC-signed
 * token so cross-container serverless invocations work reliably.
 */
export async function setSessionUser(email: string): Promise<SessionUser | null> {
  const user = getUserByEmail(email);
  if (!user) return null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const sessionId = generateSessionToken(user.id, expiresAt);

  try {
    const db = getDb();
    // Opportunistic cleanup keeps the table bounded without a background job.
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now.toISOString());
    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, user.id, expiresAt.toISOString(), now.toISOString());
  } catch (dbErr) {
    console.warn('Session DB persist notice:', dbErr);
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      secure: false, // Ensures compatibility across localhost, dev, and production
      sameSite: 'lax',
      expires: expiresAt,
      maxAge: SESSION_TTL_MS / 1000,
    });
    cookieStore.set('tracera_role_hint', user.role, {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: expiresAt,
      maxAge: SESSION_TTL_MS / 1000,
    });
  } catch (cookieErr) {
    console.warn('Cookie store set notice:', cookieErr);
  }

  return Object.assign({}, user, { sessionId });
}

/**
 * Resolves the current user from the session cookie.
 * 1. Checks local SQLite sessions table (fast cache).
 * 2. If not found in local table (e.g. serverless cold-start container on Vercel),
 *    validates HMAC signature on token and resolves user by ID.
 * Returns null if session is missing, expired, or invalid.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) return null;

    // 1. First attempt fast DB session lookup
    try {
      const db = getDb();
      const session = db.prepare(`
        SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?
      `).get(sessionId, new Date().toISOString()) as { user_id: string } | undefined;

      if (session) {
        const user = getUserById(session.user_id);
        if (user) return user;
      }
    } catch {}

    // 2. Stateless HMAC verification fallback (crucial for serverless Vercel / multi-container instances)
    const verified = verifySessionToken(sessionId);
    if (verified) {
      const user = getUserById(verified.userId);
      if (user) {
        // Opportunistically cache in local DB if possible
        try {
          const db = getDb();
          db.prepare(`
            INSERT OR IGNORE INTO sessions (id, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
          `).run(sessionId, user.id, new Date(verified.expiresAtMs).toISOString(), new Date().toISOString());
        } catch {}
        return user;
      }
    }

    return null;
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
 * 1. Multi-tenant isolation: A user from Firm A can NEVER access Firm B's documents.
 * 2. CLIENT can only access their own client organization documents.
 * 3. AUDITOR can only access assigned documents or documents in their assigned engagements/clients.
 */
export async function requireDocumentAccess(user: UserProfile, documentId: string): Promise<void> {
  const db = getDb();
  const doc = db.prepare('SELECT client_id, assigned_to, firm_id FROM documents WHERE id = ?').get(documentId) as
    | { client_id: string; assigned_to: string | null; firm_id: string | null }
    | undefined;
  if (!doc) {
    throw Object.assign(new Error('Document not found.'), { status: 404 });
  }

  // Cross-Firm Tenant Isolation Guard
  const userFirm = user.firm_id || 'firm-abc';
  const docFirm = doc.firm_id || 'firm-abc';
  if (userFirm !== docFirm) {
    throw Object.assign(new Error('Cross-firm access forbidden: Document belongs to another CA firm.'), { status: 403 });
  }

  if (user.role === 'ADMIN' || user.role === 'PARTNER') return;

  if (user.role === 'CLIENT') {
    if (doc.client_id !== user.client_id) {
      throw Object.assign(new Error('Access denied: You do not have permission to view this document.'), { status: 403 });
    }
    return;
  }
  if (user.role === 'AUDITOR') {
    if (doc.assigned_to && doc.assigned_to !== user.id) {
      const client = db.prepare('SELECT assigned_auditor, firm_id FROM clients WHERE id = ?').get(doc.client_id) as { assigned_auditor: string | null; firm_id: string | null } | undefined;
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
