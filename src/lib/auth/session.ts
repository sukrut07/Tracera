import { cookies } from 'next/headers';
import { getUserByEmail, getUserById } from '@/lib/db';
import { Role, UserProfile } from '@/types';

export const SESSION_COOKIE_NAME = 'trecera_session_user';
export const SESSION_ROLE_COOKIE_NAME = 'trecera_session_role';

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const emailCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (emailCookie) {
      const user = getUserByEmail(emailCookie);
      if (user) return user;
    }

    return null;
  } catch {
    return null;
  }
}

export async function setSessionUser(email: string): Promise<UserProfile | null> {
  const user = getUserByEmail(email);
  if (!user) return null;

  const cookieStore = await cookies();
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

  cookieStore.set(SESSION_COOKIE_NAME, user.email, cookieOptions);
  cookieStore.set(SESSION_ROLE_COOKIE_NAME, user.role, cookieOptions);

  return user;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(SESSION_ROLE_COOKIE_NAME);
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Please log in to proceed');
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<UserProfile> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden: Role '${user.role}' is not authorized for this operation`);
  }
  return user;
}
