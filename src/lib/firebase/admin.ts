import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  !process.env.FIREBASE_ADMIN_PROJECT_ID.includes('placeholder')
);

let adminApp: App | undefined;

if (isFirebaseAdminConfigured && !getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (err) {
    console.warn('Firebase Admin initialization skipped:', err);
  }
} else if (getApps().length) {
  adminApp = getApps()[0];
}

export { adminApp, getAuth, getStorage };

/**
 * Verify Firebase ID token and retrieve user
 */
export async function verifyFirebaseIdToken(token: string): Promise<DecodedIdToken | null> {
  if (!isFirebaseAdminConfigured) {
    return null;
  }
  try {
    const auth = getAuth();
    return await auth.verifyIdToken(token);
  } catch (err) {
    console.error('Firebase token verification error:', err);
    return null;
  }
}
