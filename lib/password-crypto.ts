import crypto from 'crypto'
import bcryptjs from 'bcryptjs'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcryptjs.genSalt(10)
    const hash = await bcryptjs.hash(password, salt)
    return hash
  } catch (error) {
    console.error('[v0] Error hashing password with bcrypt:', error)
    throw new Error('Password hashing failed')
  }
}

/**
 * Verify a password against a bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    const isValid = await bcryptjs.compare(password, hash)
    return isValid
  } catch (error) {
    console.error('[v0] Error verifying bcrypt password:', error)
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
