import { SignJWT, jwtVerify } from "jose"

// Utility function to create JWT (server-only)
export async function createJWT(id: string): Promise<string> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not set. Please configure it in your .env.local or Vercel settings.")
    }
    const encodedSecret = new TextEncoder().encode(secret)
    const token = await new SignJWT({ id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(encodedSecret)
    return token
  } catch (error) {
    throw error
  }
}

// Utility function to decode and verify JWT (edge-runtime compatible using Web Crypto API)
export async function decodeJWT(token: string): Promise<{ id: string } | null> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return null
    }
    const encodedSecret = new TextEncoder().encode(secret)

    // jwtVerify validates BOTH the signature (with JWT_SECRET) AND the expiration
    const { payload } = await jwtVerify(token, encodedSecret)

    if (payload.id && typeof payload.id === "string") {
      return { id: payload.id }
    }
    return null
  } catch (error) {
    // jwtVerify throws if signature is invalid, token is expired, or token is malformed
    return null
  }
}
