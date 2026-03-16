import { createHmac } from "crypto"

// Helper functions for base64url encoding/decoding that work everywhere
export function toBase64Url(str: string): string {
  return Buffer.from(str, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

export function fromBase64Url(str: string): string {
  // Add padding if needed
  let padded = str + "==".substring(0, (4 - (str.length % 4)) % 4)
  // Convert base64url to base64
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(base64, "base64").toString("utf-8")
}

// Utility function to decode and verify JWT (NOT a server action, just a utility)
export function decodeJWT(token: string): { id: string } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      console.log("[v0] decodeJWT: Invalid JWT format - wrong number of parts")
      return null
    }

    const [header, payload, signature] = parts

    // Verify the signature
    const secret = process.env.JWT_SECRET || "your-secret-key"
    const expectedSignature = createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    if (signature !== expectedSignature) {
      console.log("[v0] decodeJWT: JWT signature verification failed")
      return null
    }

    // Decode the payload
    const decodedPayload = JSON.parse(fromBase64Url(payload))
    console.log("[v0] decodeJWT: Successfully decoded JWT")
    return decodedPayload
  } catch (error) {
    console.log("[v0] decodeJWT: Error decoding JWT =", error instanceof Error ? error.message : String(error))
    return null
  }
}
