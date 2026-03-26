import { CompactEncrypt, compactDecrypt } from "jose"

/**
 * ENCRYPTION_KEY should be 32 bytes (256 bits) for AES-256-GCM
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getEncryptionKey(): Uint8Array {
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }

  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(encryptionKey.length / 2)
  for (let i = 0; i < encryptionKey.length; i += 2) {
    bytes[i / 2] = parseInt(encryptionKey.substring(i, i + 2), 16)
  }

  if (bytes.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be exactly 32 bytes (256 bits). Got ${bytes.length} bytes.`)
  }

  return bytes
}

/**
 * Encrypts a JWT token using AES-256-GCM
 * The resulting token is completely opaque and cannot be read without the encryption key
 * @param token JWT token to encrypt
 * @returns Encrypted token (JWE format)
 */
export async function encryptToken(token: string): Promise<string> {
  try {
    const encryptionKey = getEncryptionKey()

    const jwe = await new CompactEncrypt(new TextEncoder().encode(token))
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .encrypt(encryptionKey)

    return jwe
  } catch (error) {
    console.error("[v0] Token encryption failed:", error)
    throw new Error("Failed to encrypt session token")
  }
}

/**
 * Decrypts a JWE token back to original JWT
 * @param encryptedToken Encrypted token (JWE format)
 * @returns Decrypted JWT token
 */
export async function decryptToken(encryptedToken: string): Promise<string | null> {
  try {
    const encryptionKey = getEncryptionKey()

    const { plaintext } = await compactDecrypt(encryptedToken, encryptionKey)
    const token = new TextDecoder().decode(plaintext)

    return token
  } catch (error) {
    console.error("[v0] Token decryption failed:", error)
    return null
  }
}
