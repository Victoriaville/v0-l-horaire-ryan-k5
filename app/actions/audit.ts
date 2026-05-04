"use server"

import { neon } from "@neondatabase/serverless"
import { headers } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export type AuditActionType =
  | "ASSIGNMENT_CREATED"
  | "ASSIGNMENT_DELETED"
  | "SECOND_REPLACEMENT_ADDED"
  | "REPLACEMENT_CREATED"
  | "REPLACEMENT_APPROVED"
  | "REPLACEMENT_REJECTED"
  | "REPLACEMENT_REQUEST_APPROVED"
  | "REPLACEMENT_REQUEST_REJECTED"
  | "REPLACEMENT_ASSIGNED"
  | "REPLACEMENT_APPLICATION_ADDED"
  | "EXCHANGE_CREATED"
  | "EXCHANGE_APPROVED"
  | "EXCHANGE_REJECTED"
  | "LEAVE_CREATED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "LEAVE_UPDATED"
  | "LEAVE_DELETED"
  | "NOTIFICATION_ERROR_ACKNOWLEDGED"
  | "ADMIN_STATUS_CHANGED"
  | "OWNER_STATUS_CHANGED"
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGED_OWN"
  | "PASSWORD_RESET_ADMIN"
  | "SHIFT_CREATED"
  | "SHIFT_DELETED"
  | "SHIFT_UPDATED"
  | "TEAM_CREATED"
  | "TEAM_MEMBER_ADDED"
  | "TEAM_MEMBER_REMOVED"
  | "FIREFIGHTER_ROLE_UPDATED"
  | "FIREFIGHTER_DELETED"
  | "TEAM_MEMBERS_REORDERED"
  | "SHIFT_ASSIGNMENT_CREATED"
  | "SHIFT_ASSIGNMENT_DELETED"
  | "SHIFT_NOTE_CREATED"
  | "SHIFT_NOTE_UPDATED"
  | "NOTIFICATION_SENT_MANUAL"

interface AuditLogParams {
  userId: number
  actionType: AuditActionType
  tableName?: string
  recordId?: number
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  description: string
}

/**
 * Fonction principale pour créer un log d'audit
 * Utilisée partout dans l'application pour tracer les actions importantes
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null

    await sql`
      INSERT INTO audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        description,
        ip_address
      ) VALUES (
        ${params.userId},
        ${params.actionType},
        ${params.tableName || null},
        ${params.recordId || null},
        ${params.oldValues ? JSON.stringify(params.oldValues) : null},
        ${params.newValues ? JSON.stringify(params.newValues) : null},
        ${params.description},
        ${ipAddress}
      )
    `
  } catch (error) {
    console.error("[v0] Error creating audit log:", error)
    // Ne pas faire échouer l'opération principale si le logging échoue
  }
}

/**
 * Récupérer les logs d'audit avec pagination et filtres
 */
export async function getAuditLogs(options: {
  page?: number
  limit?: number
  userId?: number
  actionType?: AuditActionType
  startDate?: string
  endDate?: string
}) {
  const page = options.page || 1
  const limit = options.limit || 100
  const offset = (page - 1) * limit

  try {
    let whereClause = ""
    const params: (string | number)[] = []
    let paramIndex = 1

    if (options.userId) {
      whereClause += `user_id = $${paramIndex}`
      params.push(options.userId)
      paramIndex++
    }

    if (options.actionType) {
      if (whereClause) whereClause += " AND "
      whereClause += `action_type = $${paramIndex}`
      params.push(options.actionType)
      paramIndex++
    }

    if (options.startDate) {
      if (whereClause) whereClause += " AND "
      whereClause += `created_at >= $${paramIndex}`
      params.push(options.startDate)
      paramIndex++
    }

    if (options.endDate) {
      if (whereClause) whereClause += " AND "
      whereClause += `created_at <= $${paramIndex}`
      params.push(options.endDate)
      paramIndex++
    }

    const fullWhereClause = whereClause ? `WHERE ${whereClause}` : ""

    // Compter le total
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${fullWhereClause}`
    const countResult = await db.query(countQuery, params)
    const total = Number.parseInt(countResult.rows[0]?.total || "0")

    // Récupérer les logs avec les informations de l'utilisateur
    const logsQuery = `
      SELECT 
        al.id,
        al.user_id,
        al.action_type,
        al.table_name,
        al.record_id,
        al.old_values,
        al.new_values,
        al.description,
        al.ip_address,
        al.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${fullWhereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const logsParams = [...params, limit, offset]
    const logsResult = await db.query(logsQuery, logsParams)
    const logs = logsResult.rows as AuditLog[]

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("[v0] Error fetching audit logs:", error)
    throw new Error("Erreur lors de la récupération des logs d'audit")
  }
}

/**
 * Nettoyer les logs de plus d'1 an
 * Cette fonction peut être appelée par un cron job
 */
export async function cleanupOldAuditLogs(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM audit_logs
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year'
      RETURNING id
    `

    return result.length
  } catch (error) {
    console.error("[v0] Error cleaning up old audit logs:", error)
    throw new Error("Erreur lors du nettoyage des anciens logs")
  }
}
