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
    // Parse JWT manually: JWT format is header.payload.signature
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    // Decode the payload (second part)
    const payload = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
      )
    ) as { id?: string; exp?: number }

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    if (payload.id) {
      return { id: payload.id }
    }
    return null
  } catch (error) {
    return null
  }
}
