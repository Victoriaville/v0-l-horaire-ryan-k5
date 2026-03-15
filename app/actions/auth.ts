"use server"

import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { createHmac } from "crypto"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: "captain" | "lieutenant" | "firefighter"
  is_admin: boolean
  is_owner?: boolean // Added optional is_owner field for owner permissions
  phone?: string
}

// Utility function to decode and verify JWT
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
      .digest("base64url")

    if (signature !== expectedSignature) {
      console.log("[v0] decodeJWT: JWT signature verification failed")
      return null
    }

    // Decode the payload
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"))
    console.log("[v0] decodeJWT: Successfully decoded JWT")
    return decodedPayload
  } catch (error) {
    console.log("[v0] decodeJWT: Error decoding JWT =", error instanceof Error ? error.message : String(error))
    return null
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // Generate a random salt
  const salt = new Uint8Array(16)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(salt)
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < salt.length; i++) {
      salt[i] = Math.floor(Math.random() * 256)
    }
  }

  // Import the password as a key
  const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  )

  // Combine salt and hash
  const hashArray = new Uint8Array(derivedBits)
  const combined = new Uint8Array(salt.length + hashArray.length)
  combined.set(salt)
  combined.set(hashArray, salt.length)

  // Convert to base64
  return Buffer.from(combined).toString("base64")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    // Decode the stored hash
    const combined = Buffer.from(hash, "base64")
    const salt = combined.slice(0, 16)
    const storedHash = combined.slice(16)

    // Import the password as a key
    const key = await crypto.subtle.importKey("raw", data, { name: "PBKDF2" }, false, ["deriveBits"])

    // Derive bits using the same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    )

    const derivedHash = new Uint8Array(derivedBits)

    // Compare the hashes
    if (derivedHash.length !== storedHash.length) {
      return false
    }

    for (let i = 0; i < derivedHash.length; i++) {
      if (derivedHash[i] !== storedHash[i]) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error("[v0] Password verification error:", error)
    return false
  }
}

async function createSession(userId: number): Promise<string> {
  const sessionToken = generateUUID()
  const cookieStore = await cookies()

  // Extract domain from NEXT_PUBLIC_APP_URL for proper cookie domain setting
  let cookieDomain: string | undefined
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  console.log("[v0] createSession: NEXT_PUBLIC_APP_URL =", appUrl)
  
  if (appUrl) {
    try {
      cookieDomain = new URL(appUrl).hostname
      console.log("[v0] createSession: Extracted domain =", cookieDomain)
    } catch (error) {
      console.error("[v0] createSession: Invalid NEXT_PUBLIC_APP_URL:", error)
    }
  } else {
    console.warn("[v0] createSession: NEXT_PUBLIC_APP_URL is not defined - will use default domain handling")
  }

  // Detect HTTPS from the APP URL - works on HTTP and HTTPS
  const isHttps = appUrl?.startsWith("https://") ?? false
  
  console.log("[v0] createSession: isHttps =", isHttps)

  // Build cookie options - domain is optional and will be set only if explicitly configured
  const cookieOptions: any = {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  }
  
  // Only add domain if we have one from NEXT_PUBLIC_APP_URL
  if (cookieDomain) {
    cookieOptions.domain = cookieDomain
    console.log("[v0] createSession: Setting cookie domain =", cookieDomain)
  } else {
    console.log("[v0] createSession: No domain configured, letting browser handle cookie domain")
  }
  
  console.log("[v0] createSession: Final cookie options =", cookieOptions)

  // Create a simple JWT payload
  const jwtPayload = {
    id: userId.toString(),
    iat: Math.floor(Date.now() / 1000),
  }
  
  // Convert to base64 for simple JWT-like encoding
  // Format: header.payload.signature (we'll use a simple format for now)
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const payload = Buffer.from(JSON.stringify(jwtPayload)).toString("base64url")
  
  // Create a simple signature using the secret
  const secret = process.env.JWT_SECRET || "your-secret-key"
  const crypto = await import("crypto")
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url")
  
  const jwt = `${header}.${payload}.${signature}`
  
  console.log("[v0] createSession: JWT created successfully")

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
      console.log("[v0] getSession: No JWT token found in cookie")
      return null
    }

    // Decode and verify the JWT
    const decoded = decodeJWT(jwtToken)
    if (!decoded || !decoded.id) {
      console.log("[v0] getSession: Failed to decode JWT")
      return null
    }

    const userId = Number.parseInt(decoded.id)
    console.log("[v0] getSession: Extracted userId from JWT =", userId)

    // Check cache first
    const cacheKey = `user_${userId}`
    const cached = sessionCache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < CACHE_TTL) {
      console.log("[v0] getSession: Returning cached user")
      return cached.user
    }

    let retries = 3
    let delay = 100 // Start with 100ms delay

    while (retries > 0) {
      try {
        // Cache miss or expired, fetch from database
        const result = await sql`
          SELECT id, email, first_name, last_name, role, is_admin, is_owner, phone
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
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] getSession: Error occurred:", errorMessage)

    if (errorMessage.includes("Too Many") || errorMessage.includes("rate limit")) {
      console.error("[v0] getSession: Rate limiting detected. Too many database requests.")
    }

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
    return { error: "Email requis" }
  }

  try {
    const result = await sql`
      SELECT id, email, password_hash, first_name, last_name, role, is_admin, is_owner
      FROM users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return { error: "Email incorrect" }
    }

    const user = result[0]

    if (user.password_hash !== null && user.password_hash !== undefined) {
      // If user has a password set, verify it
      if (!password) {
        return { error: "Mot de passe requis pour cet utilisateur" }
      }
      const isValid = await verifyPassword(password, user.password_hash)
      if (!isValid) {
        return { error: "Mot de passe incorrect" }
      }
    }
    // If password_hash is NULL, allow login with email only

    await createSession(user.id)
  } catch (error) {
    console.error("[v0] Login error:", error)

    if (error instanceof Error && error.message.includes("Too Many Requests")) {
      return { error: "Trop de tentatives de connexion. Veuillez réessayer dans quelques instants." }
    }

    return { error: "Une erreur est survenue lors de la connexion. Veuillez réessayer." }
  }

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
      return { error: "Cet email est déjà utilisé" }
    }

    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES (${email}, ${passwordHash}, ${firstName}, ${lastName}, ${phone || null}, 'firefighter')
      RETURNING id
    `

    await createSession(result[0].id)
  } catch (error) {
    console.error("[v0] Register error:", error)

    if (error instanceof Error && error.message.includes("Too Many Requests")) {
      return { error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }
    }

    return { error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer." }
  }

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
    console.error("[v0] Error creating/resetting admin:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}
