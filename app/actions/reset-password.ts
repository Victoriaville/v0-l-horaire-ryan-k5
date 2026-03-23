"use server"

import { sql } from "@/lib/db"
import { hashPassword } from "@/app/actions/auth"

export async function resetUserPassword(email: string, newPassword: string) {
  try {
    // Hash the password with PBKDF2
    const passwordHash = await hashPassword(newPassword)

    // Update user's password
    const result = await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}
      WHERE email = ${email}
      RETURNING id, first_name, last_name, email
    `

    if (result.length > 0) {
      return {
        success: true,
        user: result[0],
      }
    } else {
      return {
        success: false,
        error: "Identifiants invalides",
      }
    }
  } catch (error) {
    return {
      success: false,
      error: "Identifiants invalides",
    }
  }
}

// Quick function to reset Yan Fournier's password specifically
export async function resetYanPassword() {
  return resetUserPassword("yan.fournier@victoriaville.ca", "Pompier2025!")
}
