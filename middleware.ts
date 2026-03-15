import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createHmac } from "crypto"

// Helper functions for base64url encoding/decoding
function fromBase64Url(str: string): string {
  // Add padding if needed
  let padded = str + "==".substring(0, (4 - (str.length % 4)) % 4)
  // Convert base64url to base64
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(base64, "base64").toString("utf-8")
}

// Same JWT decoding function as in auth.ts
function decodeJWT(token: string): { id: string } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [header, payload, signature] = parts

    // Verify the signature
    const secret = process.env.JWT_SECRET || "your-secret-key"
    const hmacSignature = createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64")
    // Convert base64 to base64url
    const expectedSignature = hmacSignature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")

    if (signature !== expectedSignature) {
      console.log("[v0] middleware: JWT signature verification failed")
      return null
    }

    // Decode the payload
    const decodedPayload = JSON.parse(fromBase64Url(payload))
    console.log("[v0] middleware: JWT decoded successfully")
    return decodedPayload
  } catch (error) {
    console.log("[v0] middleware: Error decoding JWT =", error instanceof Error ? error.message : String(error))
    return null
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // This must be the FIRST check before anything else
  if (pathname === "/api/telegram/webhook") {
    return NextResponse.next()
  }

  // Get the JWT from the cookie
  const cookieValue = request.cookies.get("userId")?.value
  console.log("[v0] middleware: Cookie check - JWT present =", cookieValue ? "yes" : "no")

  let userId: string | null = null

  if (cookieValue) {
    const decoded = decodeJWT(cookieValue)
    if (decoded && decoded.id) {
      userId = decoded.id
      console.log("[v0] middleware: userId extracted from JWT =", userId)
    }
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/"

  console.log("[v0] middleware: userId present =", userId ? "yes" : "no", "pathname =", pathname)

  // Redirect to login if not authenticated and trying to access protected pages
  if (!userId && !isAuthPage && !isPublicPage) {
    console.log("[v0] middleware: Redirecting to /login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (userId && isAuthPage) {
    console.log("[v0] middleware: Redirecting to /dashboard")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/telegram/webhook).*)"],
}
