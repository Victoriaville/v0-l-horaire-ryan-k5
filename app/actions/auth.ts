"use server"

import { cookies, headers } from "next/headers"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { createJWT, decodeJWT } from "@/lib/jwt"
import { isRateLimited, recordFailedAttempt, resetRateLimit, getClientIP } from "@/lib/rate-limit"
import { hashPassword as hashPasswordArgon2, verifyPassword as verifyPasswordArgon2, verifyPBKDF2 } from "@/lib/password-crypto"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "captain" | "lieutenant" | "firefighter"
  is_admin: boolean
  is_owner?: boolean // Added optional is_owner field for owner permissions
  phone?: string
  password_force_reset?: boolean // Flag to force password reset on next login
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function hashPassword(password: string): Promise<string> {
  // Use Argon2id for new passwords (more secure than PBKDF2)
  return await hashPasswordArgon2(password)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Detect format: Argon2id starts with $argon2id$, PBKDF2 is base64
    if (hash.startsWith("$argon2id$")) {
      // Modern Argon2id hash
      return await verifyPasswordArgon2(password, hash)
    } else {
      // Legacy PBKDF2 hash (base64 format)
      return await verifyPBKDF2(password, hash)
    }
  } catch (error) {
    console.error("[v0] Error verifying password:", error)
    return false
  }
}

async function createSession(userId: number): Promise<string> {
  const sessionToken = generateUUID()
  const cookieStore = await cookies()

  // Detect HTTPS from the APP URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const isHttps = appUrl?.startsWith("https://") ?? true

  // Build cookie options - DO NOT set domain explicitly as this breaks cookie persistence on Vercel
  // Let Next.js handle cookie domain automatically based on the request
  // Important: When secure=true (HTTPS), use sameSite="none" to ensure cookies persist across navigation
  // in v0 perso and other multi-domain environments
  const cookieOptions: any = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? "none" : "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  }

  // Create JWT using jose (edge-runtime compatible)
  const jwt = await createJWT(userId.toString())

  cookieStore.set("session", sessionToken, cookieOptions)
  cookieStore.set("userId", jwt, cookieOptions)

  return sessionToken
}

const sessionCache = new Map<string, { user: User | null; timestamp: number }>()
const CACHE_TTL = 60000 // 60 seconds (increased from 5 seconds)

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const jwtToken = cookieStore.get("userId")?.value

    if (!jwtToken) {
      return null
    }

    // Decode and verify the JWT
    const decoded = await decodeJWT(jwtToken)
    if (!decoded || !decoded.id) {
      return null
    }

    const userId = Number.parseInt(decoded.id)

    // Check cache first
    const cacheKey = `user_${userId}`
    const cached = sessionCache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.user
    }

    let retries = 3
    let delay = 100 // Start with 100ms delay

    while (retries > 0) {
      try {
        // Cache miss or expired, fetch from database
        const result = await sql`
          SELECT id, email, first_name, last_name, role, is_admin, is_owner, phone, password_force_reset
          FROM users
          WHERE id = ${userId}
        `

        const user = result.length > 0 ? (result[0] as User) : null

        // Update cache
        sessionCache.set(cacheKey, { user, timestamp: now })

        // Clean up old cache entries (keep cache size manageable)
        if (sessionCache.size > 100) {
          const entries = Array.from(sessionCache.entries())
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
          // Remove oldest 20 entries
          for (let i = 0; i < 20; i++) {
            sessionCache.delete(entries[i][0])
          }
        }

        return user
      } catch (dbError) {
        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError)

        if (errorMessage.includes("Too Many") || errorMessage.includes("rate limit") || errorMessage.includes("429")) {
          retries--

          if (retries > 0) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay))
            delay *= 2 // Exponential backoff
            continue
          } else {
            if (cached) {
              return cached.user
            }
          }
        }

        throw dbError
      }
    }

    return null
  } catch (error) {
    return null
  }
}

async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  cookieStore.delete("userId")
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email) {
    return { error: "Identifiants invalides" }
  }

  // Get client IP for rate limiting
  const headersInstance = await headers()
  const ip = getClientIP(headersInstance)

  // Check if IP is rate limited
  const rateLimitCheck = isRateLimited(ip)
  if (rateLimitCheck.isLocked) {
    return { error: "Compte temporairement verrouillé. Veuillez réessayer dans 15 minutes." }
  }

  try {
    const result = await sql`
      SELECT id, email, password_hash, first_name, last_name, role, is_admin, is_owner, password_force_reset
      FROM users
      WHERE email = ${email}
    `

    // Check if user exists
    if (result.length === 0) {
      recordFailedAttempt(ip)
      return { error: "Identifiants invalides" }
    }

    const user = result[0]

    // Check if password is required
    if (user.password_hash !== null && user.password_hash !== undefined) {
      // If user has a password set, verify it
      if (!password) {
        recordFailedAttempt(ip)
        return { error: "Identifiants invalides" }
      }
      const isValid = await verifyPassword(password, user.password_hash)
      if (!isValid) {
        recordFailedAttempt(ip)
        return { error: "Identifiants invalides" }
      }

      // Check if password needs to be reset (security upgrade or admin reset)
      if (user.password_force_reset) {
        // Password is valid, but user must change it
        console.log("[v0] Auth login: password_force_reset detected for user:", user.email)
        // Create a real session for authentication
        resetRateLimit(ip)
        console.log("[v0] Auth login: Creating session for user with force reset")
        await createSession(user.id)
        
        console.log("[v0] Auth login: Redirecting to password page")
        // Redirect to password reset page - this will execute OUTSIDE the try/catch
        redirect("/dashboard/settings/password?reason=admin_reset")
      }
    }
    // If password_hash is NULL, allow login with email only

    // Successful login - reset rate limit
    console.log("[v0] Auth login: Successful login for user:", user?.email, "- creating session")
    resetRateLimit(ip)
    await createSession(user.id)
    console.log("[v0] Auth login: Session created, will redirect to dashboard")
  } catch (error) {
    // Record failed attempt on error
    recordFailedAttempt(ip)

    if (error instanceof Error && error.message.includes("Too Many Requests")) {
      return { error: "Identifiants invalides" }
    }
    
    // Check if this is a redirect() error - if so, rethrow it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return { error: "Identifiants invalides" }
  }

  // Redirect after successful login - OUTSIDE try/catch so redirect exception is not caught
  console.log("[v0] Auth login: Redirecting to dashboard after successful login")
  redirect("/dashboard")
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string

  if (!email || !password || !firstName || !lastName) {
    return { error: "Tous les champs sont requis" }
  }

  try {
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existing.length > 0) {
      return { error: "Identifiants invalides" }
    }

    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES (${email}, ${passwordHash}, ${firstName}, ${lastName}, ${phone || null}, 'firefighter')
      RETURNING id
    `

    await createSession(result[0].id)
  } catch (error) {
    return { error: "Identifiants invalides" }
  }

  // Redirect after successful registration - OUTSIDE try/catch so redirect exception is not caught
  redirect("/dashboard")
}

export async function logout() {
  await destroySession()
  redirect("/login")
}

export async function createOrResetAdmin() {
  try {
    // Hash the password using PBKDF2
    const passwordHash = await hashPassword("admin123")

    // Check if admin account exists
    const existing = await sql`
      SELECT id FROM users WHERE email = 'admin@caserne.ca'
    `

    if (existing.length > 0) {
      // Update existing admin account
      await sql`
        UPDATE users
        SET password_hash = ${passwordHash},
            first_name = 'Admin',
            last_name = 'Caserne',
            role = 'captain',
            is_admin = true,
            is_owner = true
        WHERE email = 'admin@caserne.ca'
      `
    } else {
      // Create new admin account
      await sql`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_admin, is_owner)
        VALUES ('admin@caserne.ca', ${passwordHash}, 'Admin', 'Caserne', 'captain', true, true)
      `
    }

    return {
      success: true,
      email: "admin@caserne.ca",
      password: "admin123",
    }
  } catch (error) {
    return {
      success: false,
      error: "Identifiants invalides",
    }
  }
}
