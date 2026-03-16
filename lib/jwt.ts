import * as jose from "jose"

// Utility function to create JWT (server-only)
export async function createJWT(id: string): Promise<string> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const token = await jose.SignJWT({ id })
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

// Utility function to decode and verify JWT (edge-runtime compatible)
export async function decodeJWT(token: string): Promise<{ id: string } | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
    const verified = await jose.jwtVerify(token, secret)
    const payload = verified.payload as { id?: string }
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
