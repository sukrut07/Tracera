// Dynamic lazy-loaded Firebase Admin helpers to avoid Node 24 ESM ERR_REQUIRE_ESM crashes

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  !process.env.FIREBASE_ADMIN_PROJECT_ID.includes('placeholder')
);

let adminApp: any = null;

export async function getFirebaseAdminApp() {
  if (adminApp) return adminApp;
  if (!isFirebaseAdminConfigured) return null;

  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    if (getApps().length) {
      adminApp = getApps()[0];
      return adminApp;
    }

    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return adminApp;
  } catch (err) {
    console.warn('Firebase Admin dynamic initialization notice:', err);
    return null;
  }
}

export { adminApp };

export function getAuth(app?: any) {
  try {
    const { getAuth: fbGetAuth } = require('firebase-admin/auth');
    return fbGetAuth(app || adminApp);
  } catch (err) {
    console.warn('getAuth notice:', err);
    return null;
  }
}

export function getStorage(app?: any) {
  try {
    const { getStorage: fbGetStorage } = require('firebase-admin/storage');
    return fbGetStorage(app || adminApp);
  } catch (err) {
    console.warn('getStorage notice:', err);
    return null;
  }
}

/**
 * Verify Firebase ID token and retrieve user
 */
export async function verifyFirebaseIdToken(token: string): Promise<{ email?: string; uid?: string } | null> {
  if (!isFirebaseAdminConfigured || !token) {
    return null;
  }
  try {
    const app = await getFirebaseAdminApp();
    if (!app) return null;

    const { getAuth: fbGetAuth } = await import('firebase-admin/auth');
    const auth = fbGetAuth(app);
    return await auth.verifyIdToken(token);
  } catch (err) {
    console.warn('Firebase token verification error:', err);
    return null;
  }
}
