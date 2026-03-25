import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decodeJWT } from "@/lib/jwt"
import { getSession } from "@/app/actions/auth"

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
    console.log("[v0] Middleware: Checking password reset for dashboard route:", pathname)
    try {
      const user = await getSession()
      if (user?.password_force_reset) {
        console.log("[v0] Middleware: password_force_reset=TRUE detected, redirecting to password page")
        return NextResponse.redirect(new URL("/dashboard/settings/password?reason=admin_reset", request.url))
      }
    } catch (error) {
      console.log("[v0] Middleware: Error getting session:", error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
