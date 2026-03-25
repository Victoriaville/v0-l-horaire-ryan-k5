import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decodeJWT } from "@/lib/jwt"

// Edge Runtime compatible session function (no WASM dependencies)
// Only used for middleware checks, not password operations
async function getSessionForMiddleware(userId: string) {
  try {
    const { sql } = await import("@/lib/db")
    const result = await sql`
      SELECT id, email, first_name, last_name, role, is_admin, password_force_reset FROM users WHERE id = ${parseInt(userId)}
    `
    return result[0] || null
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Get the JWT from the cookie
  const cookieValue = request.cookies.get("userId")?.value

  let userId: string | null = null

  if (cookieValue) {
    const decoded = await decodeJWT(cookieValue)
    if (decoded && decoded.id) {
      userId = decoded.id
    }
  }

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublicPage = pathname === "/"

  // Redirect to login if not authenticated and trying to access protected pages
  if (!userId && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check if user needs password reset and is not already on the password page
  if (pathname.startsWith("/dashboard") && !pathname.includes("/settings/password")) {
    try {
      if (userId) {
        const user = await getSessionForMiddleware(userId)
        if (user?.password_force_reset) {
          return NextResponse.redirect(new URL("/dashboard/settings/password?reason=admin_reset", request.url))
        }
      }
    } catch (error) {
      // Error getting session, continue
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
