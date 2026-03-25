import argon2 from 'argon2';
import crypto from 'crypto';

/**
 * Hash a password using Argon2id
 * Returns the hash directly (argon2 includes salt in the hash)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
    return hash;
  } catch (error) {
    console.error('[v0] Error hashing password with Argon2id:', error);
    throw error;
  }
}

/**
 * Verify a password against an Argon2id hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('[v0] Error verifying Argon2id password:', error);
    return false;
  }
}

/**
 * Verify a password against a legacy PBKDF2 SHA-256 hash
 * Used only during migration from old hashes
 * Format: base64(salt + hash) where salt=16 bytes, hash=32 bytes
 */
export async function verifyPBKDF2(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // The hash is base64 encoded (salt + derived key)
    const buffer = Buffer.from(hash, 'base64');

    if (buffer.length !== 48) {
      console.error('[v0] Invalid PBKDF2 hash length');
      return false;
    }

    // Extract salt (first 16 bytes) and stored hash (last 32 bytes)
    const salt = buffer.slice(0, 16);
    const storedHash = buffer.slice(16, 48);

    // Derive key using same parameters as original
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    // Compare timing-safe
    return crypto.timingSafeEqual(derivedKey, storedHash);
  } catch (error) {
    console.error('[v0] Error verifying PBKDF2 password:', error);
    return false;
  }
}
