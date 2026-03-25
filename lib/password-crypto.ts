import crypto from 'crypto'
import { argon2id, argon2Verify } from 'hash-wasm'

/**
 * Hash a password using Argon2id via hash-wasm
 * hash-wasm bundles WASM as base64 strings directly in the JS - no external file loading,
 * no MIME type issues, no path resolution problems. Works in v0, Vercel, Node.js, browsers.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Generate random salt (16 bytes) using Node.js crypto.randomBytes
    const salt = new Uint8Array(crypto.randomBytes(16))

    // Hash with Argon2id parameters - outputType "encoded" stores all params in the string
    // so verification works without storing salt separately
    const hash = await argon2id({
      password,
      salt,
      parallelism: 4,
      iterations: 3,
      memorySize: 65536, // 64MB
      hashLength: 32,
      outputType: 'encoded', // standard $argon2id$... format, includes salt and params
    })

    return hash
  } catch (error) {
    console.error('[v0] Error hashing password with Argon2id:', error)
    throw new Error('Password hashing failed - Argon2id not available')
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
    // argon2Verify handles encoded format (extracts salt/params automatically)
    const isValid = await argon2Verify({ password, hash })
    return isValid
  } catch (error) {
    console.error('[v0] Error verifying Argon2id password:', error)
    return false
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
    const buffer = Buffer.from(hash, 'base64')

    if (buffer.length !== 48) {
      console.error('[v0] Invalid PBKDF2 hash length')
      return false
    }

    const salt = buffer.slice(0, 16)
    const storedHash = buffer.slice(16, 48)
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')

    if (derivedKey.length !== storedHash.length) return false

    try {
      return crypto.timingSafeEqual(derivedKey, storedHash)
    } catch {
      let equal = true
      for (let i = 0; i < derivedKey.length; i++) {
        if (derivedKey[i] !== storedHash[i]) equal = false
      }
      return equal
    }
  } catch (error) {
    console.error('[v0] Error verifying PBKDF2 password:', error)
    return false
  }
}
