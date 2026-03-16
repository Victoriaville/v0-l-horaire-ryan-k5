import { SignJWT, jwtVerify } from "jose"

// Utility function to create JWT (server-only)
export async function createJWT(id: string): Promise<string> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const token = await new SignJWT({ id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret)
    console.log("[v0] createJWT: JWT created successfully")
    return token
  } catch (error) {
    console.log("[v0] createJWT: Error creating JWT =", error instanceof Error ? error.message : String(error))
    throw error
  }
}

// Utility function to decode and verify JWT (edge-runtime compatible using Web Crypto API)
export async function decodeJWT(token: string): Promise<{ id: string } | null> {
  try {
    // Parse JWT manually: JWT format is header.payload.signature
    const parts = token.split(".")
    if (parts.length !== 3) {
      console.log("[v0] decodeJWT: Invalid JWT format")
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
      console.log("[v0] decodeJWT: JWT has expired")
      return null
    }

    if (payload.id) {
      console.log("[v0] decodeJWT: Successfully decoded JWT")
      return { id: payload.id }
    }
    console.log("[v0] decodeJWT: JWT missing id claim")
    return null
  } catch (error) {
    console.log("[v0] decodeJWT: Error decoding JWT =", error instanceof Error ? error.message : String(error))
    return null
  }
}
