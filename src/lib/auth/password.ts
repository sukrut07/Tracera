import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const PREFIX = 'scrypt';

/**
 * Hash a password for the local-development authentication path. Production
 * authentication is delegated to Firebase and never uses this value.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('base64url');
  const derived = scryptSync(password, salt, KEY_LENGTH);
  return `${PREFIX}$${salt}$${derived.toString('base64url')}`;
}

/** Returns false for malformed or non-matching hashes without leaking why. */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;

  const [prefix, salt, expectedEncoded] = storedHash.split('$');
  if (prefix !== PREFIX || !salt || !expectedEncoded) return false;

  try {
    const expected = Buffer.from(expectedEncoded, 'base64url');
    const actual = scryptSync(password, salt, KEY_LENGTH);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
