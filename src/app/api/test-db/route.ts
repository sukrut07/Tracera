import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, any> = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    isVercel: Boolean(process.env.VERCEL),
    cwd: process.cwd(),
  };

  try {
    const { isFirebaseAdminConfigured } = await import('@/lib/firebase/admin');
    diagnostics.firebaseAdmin = { isConfigured: isFirebaseAdminConfigured };
  } catch (err: any) {
    diagnostics.firebaseAdminError = err.message || String(err);
  }

  try {
    const { verifyPassword } = await import('@/lib/auth/password');
    diagnostics.verifyPassword = typeof verifyPassword === 'function' ? 'OK' : 'FAIL';
  } catch (err: any) {
    diagnostics.verifyPasswordError = err.message || String(err);
  }

  try {
    const { getDb, getUserAuthByEmail, getUserByEmail } = await import('@/lib/db');
    diagnostics.dbModule = 'OK';
    const db = getDb();
    diagnostics.getDb = 'OK';
    const user = getUserAuthByEmail('auditor@demo.com');
    diagnostics.getUserAuthByEmail = user ? { id: user.id, email: user.email } : 'NOT_FOUND';
    const profile = getUserByEmail('auditor@demo.com');
    diagnostics.getUserByEmail = profile ? { id: profile.id, role: profile.role } : 'NOT_FOUND';
  } catch (err: any) {
    diagnostics.dbModuleError = err.message || String(err);
  }

  try {
    const { setSessionUser, getCurrentUser } = await import('@/lib/auth/session');
    diagnostics.sessionModule = 'OK';
  } catch (err: any) {
    diagnostics.sessionModuleError = err.message || String(err);
  }

  return NextResponse.json(diagnostics);
}
