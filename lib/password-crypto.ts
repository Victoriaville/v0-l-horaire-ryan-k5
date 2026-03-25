import crypto from 'crypto'
import fs from 'fs'
import { createRequire } from 'module'

// Load argon2id using Node.js setupWasm (no bundler needed)
// Per official docs: in Node.js, use setupWasm + fs.readFileSync to load .wasm binaries
async function loadArgon2id() {
  const setupWasm = (await import('argon2id/lib/setup.js')).default
  const require = createRequire(import.meta.url)
  const simdPath = require.resolve('argon2id/dist/simd.wasm')
  const noSimdPath = require.resolve('argon2id/dist/no-simd.wasm')

  return setupWasm(
    (importObject: WebAssembly.Imports) =>
      WebAssembly.instantiate(fs.readFileSync(simdPath), importObject),
    (importObject: WebAssembly.Imports) =>
      WebAssembly.instantiate(fs.readFileSync(noSimdPath), importObject),
  )
}

/**
 * Hash a password using Argon2id via Node.js WASM (no bundler)
 * Uses argon2id (by OpenPGP) loaded directly from disk via fs.readFileSync
 * Avoids ESM loader MIME type issues in v0/Vercel environments
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    console.log('[v0] Hashing password with Argon2id (Node WASM)')
    const argon2id = await loadArgon2id()

    // Generate random salt (16 bytes)
    const salt = crypto.randomBytes(16)

    // Hash with Argon2id parameters (RFC 9106)
    const hash = argon2id({
      password: new TextEncoder().encode(password),
      salt: new Uint8Array(salt),
      parallelism: 4,
      passes: 2,
      memorySize: Math.pow(2, 16), // 64MB
    })

    // Combine salt + hash for storage (format: salt || hash)
    const combined = new Uint8Array(salt.length + hash.length)
    combined.set(new Uint8Array(salt), 0)
    combined.set(hash, salt.length)

    return Buffer.from(combined).toString('base64')
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
    console.log('[v0] Verifying password with Argon2id (Node WASM)')
    const argon2id = await loadArgon2id()

    // Decode the combined hash from base64
    const combined = Buffer.from(hash, 'base64')

    // Extract salt (first 16 bytes) and stored hash (rest)
    const salt = new Uint8Array(combined.buffer, combined.byteOffset, 16)
    const storedHash = new Uint8Array(combined.buffer, combined.byteOffset + 16)

    // Re-hash the password with the extracted salt
    const newHash = argon2id({
      password: new TextEncoder().encode(password),
      salt: salt,
      parallelism: 4,
      passes: 2,
      memorySize: Math.pow(2, 16),
    })

    // Compare hashes (timing-safe)
    if (newHash.length !== storedHash.length) return false

    try {
      return crypto.timingSafeEqual(Buffer.from(newHash), Buffer.from(storedHash))
    } catch {
      let equal = true
      for (let i = 0; i < newHash.length; i++) {
        if (newHash[i] !== storedHash[i]) equal = false
      }
      return equal
    }
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

    // Compare timing-safe
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
