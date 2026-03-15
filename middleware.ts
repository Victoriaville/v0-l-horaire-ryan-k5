import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createHmac } from "crypto"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // This must be the FIRST check before anything else
  if (pathname === "/api/telegram/webhook") {
    // Return immediately with no modifications
    return NextResponse.next()
  }

  // Get the JWT from the cookie
  const cookieValue = request.cookies.get("userId")?.value
  console.log("[v0] middleware: cookieValue received =", cookieValue ? "yes" : "no")

  let userId: string | null = null

  if (cookieValue) {
    try {
      // Parse the JWT (header.payload.signature)
      const parts = cookieValue.split(".")
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format")
      }

      const [header, payload, signature] = parts

      // Verify the signature
      const secret = process.env.JWT_SECRET || "your-secret-key"
      const expectedSignature = createHmac("sha256", secret)
        .update(`${header}.${payload}`)
        .digest("base64url")

      if (signature !== expectedSignature) {
        console.log("[v0] middleware: JWT signature verification failed")
        userId = null
      } else {
        // Decode the payload
        const decodedPayload = JSON.parse(
          Buffer.from(payload, "base64url").toString("utf-8")
        )
        console.log("[v0] middleware: JWT decoded successfully, payload =", decodedPayload)
        userId = decodedPayload.id as string
      }
    } catch (error) {
      console.log("[v0] middleware: JWT parsing/verification error =", error instanceof Error ? error.message : String(error))
      userId = null
    }
  } else {
    console.log("[v0] middleware: No userId cookie found")
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/"

  console.log("[v0] middleware: userId =", userId ? "present" : "null", "pathname =", pathname)

  // Redirect to login if not authenticated and trying to access protected pages
  if (!userId && !isAuthPage && !isPublicPage) {
    console.log("[v0] middleware: Redirecting to /login (not authenticated)")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (userId && isAuthPage) {
    console.log("[v0] middleware: Redirecting to /dashboard (already authenticated)")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/telegram/webhook).*)"],
}
