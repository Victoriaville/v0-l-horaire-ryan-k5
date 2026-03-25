import crypto from 'crypto'

/**
 * Hash a password using Argon2id via WebAssembly
 * Uses argon2-wasm for universal compatibility (works in Vercel, Node.js, browsers, etc.)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    console.log('[v0] Hashing password with Argon2id WASM')
    const argon2 = await import('argon2-wasm')
    
    // Generate random salt
    const salt = crypto.randomBytes(16)
    
    // Hash with Argon2id parameters
    const hash = await argon2.hash({
      password: Buffer.from(password),
      salt: salt,
      time: 3,
      mem: 65536, // 64MB
      parallelism: 4,
      hashLen: 32,
      type: argon2.ArgonType.Argon2id,
    })
    
    return hash.toString('base64')
  } catch (error) {
    console.error('[v0] Error hashing password with Argon2id WASM:', error)
    throw new Error('Password hashing failed - Argon2id WASM not available')
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
    console.log('[v0] Verifying password with Argon2id WASM')
    const argon2 = await import('argon2-wasm')
    
    // Decode the hash from base64
    const hashBuffer = Buffer.from(hash, 'base64')
    
    // Verify the password
    return await argon2.verify({
      password: Buffer.from(password),
      hash: hashBuffer,
    })
  } catch (error) {
    console.error('[v0] Error verifying Argon2id WASM password:', error)
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
    // The hash is base64 encoded (salt + derived key)
    const buffer = Buffer.from(hash, 'base64')

    if (buffer.length !== 48) {
      console.error('[v0] Invalid PBKDF2 hash length')
      return false
    }

    // Extract salt (first 16 bytes) and stored hash (last 32 bytes)
    const salt = buffer.slice(0, 16)
    const storedHash = buffer.slice(16, 48)

    // Derive key using same parameters as original
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256')

    // Compare timing-safe (manual comparison if timingSafeEqual is not available)
    if (derivedKey.length !== storedHash.length) {
      return false
    }

    try {
      return crypto.timingSafeEqual(derivedKey, storedHash)
    } catch {
      // Fallback: manual constant-time comparison
      let equal = true
      for (let i = 0; i < derivedKey.length; i++) {
        if (derivedKey[i] !== storedHash[i]) {
          equal = false
        }
      }
      return equal
    }
  } catch (error) {
    console.error('[v0] Error verifying PBKDF2 password:', error)
    return false
  }
}
