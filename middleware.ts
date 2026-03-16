import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decodeJWT } from "@/lib/jwt"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // This must be the FIRST check before anything else
  if (pathname === "/api/telegram/webhook") {
    return NextResponse.next()
  }

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

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/telegram/webhook).*)"],
}
