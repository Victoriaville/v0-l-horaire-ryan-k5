"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/app/actions/auth"
import { createAuditLog } from "@/app/actions/audit"

// Helper function to check if user is admin
export async function isUserAdmin(userId?: number): Promise<boolean> {
  try {
    const session = await getSession()

    if (!session) return false

    const userIdToCheck = userId || session.id

    const result = await sql`
      SELECT role, is_admin
      FROM users
      WHERE id = ${userIdToCheck}
    `

    if (result.length === 0) {
      return false
    }

    const user = result[0]
    const isAdmin = user.is_admin === true

    // User has is_admin flag
    return isAdmin
  } catch (error) {
    console.error("isUserAdmin: Error", error)
    return false
  }
}

// Helper function to check if user is owner
export async function isUserOwner(userId?: number): Promise<boolean> {
  try {
    const session = await getSession()

    if (!session) return false

    const userIdToCheck = userId || session.id

    const result = await sql`
      SELECT is_owner
      FROM users
      WHERE id = ${userIdToCheck}
    `

    if (result.length === 0) {
      return false
    }

    const user = result[0]
    return user.is_owner === true
  } catch (error) {
    console.error("isUserOwner: Error", error)
    return false
  }
}

export async function getAllUsersWithAdminStatus() {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Non authentifié" }
  }

  // Check if current user is admin
  const currentUserIsAdmin = await isUserAdmin()
  if (!currentUserIsAdmin) {
    return { success: false, error: "Accès refusé - Réservé aux admins" }
  }

  // Check if current user is owner (for showing owner toggle)
  const currentUserIsOwner = await isUserOwner()

  try {
    const users = await sql`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        role,
        is_admin,
        is_owner,
        created_at
      FROM users
      ORDER BY 
        CASE role
          WHEN 'captain' THEN 1
          WHEN 'lieutenant' THEN 2
          WHEN 'firefighter' THEN 3
          ELSE 4
        END,
        last_name,
        first_name
    `

    return {
      success: true,
      currentUserIsOwner,
      users: users.map((user) => ({
        ...user,
        // Admin status is determined only by is_admin flag
        isAdmin: user.is_admin === true,
        isOwner: user.is_owner === true,
        canModifyAdmin: true, // All users can have admin status toggled
      })),
    }
  } catch (error) {
    console.error("getAllUsersWithAdminStatus: Error", error)
    return {
      success: false,
      error: "Erreur lors de la récupération des utilisateurs",
    }
  }
}

export async function toggleUserAdminStatus(userId: number, makeAdmin: boolean) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Non authentifié" }
  }

  // Check if current user is admin
  const currentUserIsAdmin = await isUserAdmin()
  if (!currentUserIsAdmin) {
    return { success: false, error: "Accès refusé - Réservé aux admins" }
  }

  try {
    // Check if target user exists and get current admin status
    const targetUser = await sql`
      SELECT id, is_admin, first_name, last_name FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return { success: false, error: "Utilisateur introuvable" }
    }

    const currentAdminStatus = targetUser[0].is_admin
    const targetUserName = `${targetUser[0].first_name} ${targetUser[0].last_name}`

    // Update admin status
    await sql`
      UPDATE users
      SET is_admin = ${makeAdmin}
      WHERE id = ${userId}
    `

    // Log the action to audit trail
    await createAuditLog({
      userId: session.id,
      actionType: "ADMIN_STATUS_CHANGED",
      tableName: "users",
      recordId: userId,
      oldValues: { is_admin: currentAdminStatus },
      newValues: { is_admin: makeAdmin },
      description: `Admin status changed from ${currentAdminStatus} to ${makeAdmin} for user ${targetUserName} (ID: ${userId})`,
    })

    return {
      success: true,
      message: makeAdmin ? "Utilisateur promu administrateur" : "Privilèges administrateur retirés",
    }
  } catch (error) {
    console.error("toggleUserAdminStatus: Error", error)
    return {
      success: false,
      error: "Erreur lors de la modification du statut",
    }
  }
}

export async function toggleUserOwnerStatus(userId: number, makeOwner: boolean) {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Non authentifié" }
  }

  // Check if current user is owner (only owners can modify owner status)
  const currentUserIsOwner = await isUserOwner()
  if (!currentUserIsOwner) {
    return { success: false, error: "Accès refusé - Réservé aux propriétaires" }
  }

  try {
    // Check if target user exists and get current owner status
    const targetUser = await sql`
      SELECT id, is_owner, first_name, last_name FROM users WHERE id = ${userId}
    `

    if (targetUser.length === 0) {
      return { success: false, error: "Utilisateur introuvable" }
    }

    const currentOwnerStatus = targetUser[0].is_owner
    const targetUserName = `${targetUser[0].first_name} ${targetUser[0].last_name}`

    // Update owner status
    await sql`
      UPDATE users
      SET is_owner = ${makeOwner}
      WHERE id = ${userId}
    `

    // Log the action to audit trail
    await createAuditLog({
      userId: session.id,
      actionType: "OWNER_STATUS_CHANGED",
      tableName: "users",
      recordId: userId,
      oldValues: { is_owner: currentOwnerStatus },
      newValues: { is_owner: makeOwner },
      description: `Owner status changed from ${currentOwnerStatus} to ${makeOwner} for user ${targetUserName} (ID: ${userId})`,
    })

    return {
      success: true,
      message: makeOwner ? "Utilisateur promu propriétaire" : "Statut propriétaire retiré",
    }
  } catch (error) {
    console.error("toggleUserOwnerStatus: Error", error)
    return {
      success: false,
      error: "Erreur lors de la modification du statut propriétaire",
    }
  }
}
