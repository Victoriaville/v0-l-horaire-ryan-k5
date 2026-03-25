/**
 * Generate a secure ENCRYPTION_KEY for JWE token encryption
 * Usage: node scripts/generate-encryption-key.js
 *
 * The generated key is 32 bytes (256 bits) and suitable for AES-256-GCM
 */

const crypto = require("crypto")

const encryptionKey = crypto.randomBytes(32).toString("hex")

console.log("\n✅ Generated ENCRYPTION_KEY:\n")
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`)
console.log("Add this to your .env.local file for local development")
console.log("For production, add this to Vercel Settings → Environment Variables\n")
