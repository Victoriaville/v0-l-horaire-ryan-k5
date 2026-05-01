"use server"
import { getSession } from "@/app/actions/auth"
import { sql, invalidateCache } from "@/lib/db"
import { createAuditLog } from "@/app/actions/audit"

export async function getShiftNote(shiftId: number, shiftDate: string) {
  try {
    const result = await sql`
      SELECT 
        sn.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM shift_notes sn
      LEFT JOIN users u ON sn.created_by = u.id
      WHERE sn.shift_id = ${shiftId} 
      AND sn.shift_date = ${shiftDate}
    `

    return result[0] || null
  } catch (error: any) {
    if (error?.code === "42P01") {
      console.log("[v0] shift_notes table doesn't exist yet - returning null")
      return null
    }
    console.error("[v0] Error fetching shift note:", error)
    return null
  }
}

export async function getShiftNotesForDateRange(startDate: string, endDate: string) {
  try {
    const result = await sql`
      SELECT 
        sn.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM shift_notes sn
      LEFT JOIN users u ON sn.created_by = u.id
      WHERE sn.shift_date >= ${startDate} 
      AND sn.shift_date <= ${endDate}
    `

    return result
  } catch (error: any) {
    if (error?.code === "42P01") {
      console.log("[v0] shift_notes table doesn't exist yet - returning empty array")
      return []
    }
    console.error("[v0] Error fetching shift notes for date range:", error)
    return []
  }
}

export async function createOrUpdateShiftNote(shiftId: number, shiftDate: string, note: string) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return { success: false, error: "Non authentifié" }
    }

    if (!session.is_admin) {
      return { success: false, error: "Seuls les administrateurs peuvent créer ou modifier des notes" }
    }

    if (!note.trim()) {
      return { success: false, error: "La note ne peut pas être vide" }
    }

    // Check if note already exists (for UPDATE detection)
    const existing = await sql`
      SELECT id, note FROM shift_notes 
      WHERE shift_id = ${shiftId} AND shift_date = ${shiftDate}
    `

    const isUpdate = existing.length > 0
    const oldNote = isUpdate ? existing[0].note : null

    if (existing.length > 0) {
      // Update existing note
      await sql`
        UPDATE shift_notes 
        SET note = ${note.trim()}, updated_at = CURRENT_TIMESTAMP
        WHERE shift_id = ${shiftId} AND shift_date = ${shiftDate}
      `
    } else {
      // Create new note
      await sql`
        INSERT INTO shift_notes (shift_id, shift_date, note, created_by)
        VALUES (${shiftId}, ${shiftDate}, ${note.trim()}, ${session.id})
      `
    }

    // Log the shift note creation or update
    const actionType = isUpdate ? "SHIFT_NOTE_UPDATED" : "SHIFT_NOTE_CREATED"
    
    await createAuditLog({
      userId: session.id,
      actionType: actionType,
      tableName: "shift_notes",
      recordId: shiftId,
      oldValues: isUpdate ? { note: oldNote } : null,
      newValues: { 
        shift_id: shiftId,
        shift_date: shiftDate,
        note: note.trim()
      },
      description: `Shift note ${isUpdate ? "updated" : "created"} for shift ID: ${shiftId} on ${shiftDate}. Note: "${note.trim().substring(0, 100)}${note.trim().length > 100 ? "..." : ""}"`,
    })

    try {
      invalidateCache()
    } catch (cacheError) {
      console.error("[v0] Error invalidating cache:", cacheError)
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error in createOrUpdateShiftNote:", error)

    if (error?.code === "42P01") {
      return {
        success: false,
        error: "La table shift_notes n'existe pas encore. Veuillez exécuter le script SQL 023-create-shift-notes.sql",
      }
    }
    return {
      success: false,
      error: "Erreur lors de la sauvegarde de la note: " + (error?.message || "Erreur inconnue"),
    }
  }
}

export async function deleteShiftNote(shiftId: number, shiftDate: string) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return { success: false, error: "Non authentifié" }
    }

    if (!session.is_admin) {
      return { success: false, error: "Seuls les administrateurs peuvent supprimer des notes" }
    }

    // Get note details BEFORE deletion for logging
    const note = await sql`
      SELECT id, note FROM shift_notes 
      WHERE shift_id = ${shiftId} AND shift_date = ${shiftDate}
    `

    if (note.length === 0) {
      return { success: false, error: "Note introuvable" }
    }

    const noteData = note[0]
    console.log("[v0] About to delete note, noteData:", noteData)

    await sql`
      DELETE FROM shift_notes 
      WHERE shift_id = ${shiftId} AND shift_date = ${shiftDate}
    `

    console.log("[v0] Note deleted, about to log audit event")

    // Log the shift note deletion
    try {
      await createAuditLog({
        userId: session.id,
        actionType: "SHIFT_NOTE_DELETED",
        tableName: "shift_notes",
        recordId: shiftId,
        oldValues: { note: noteData.note },
        newValues: null,
        description: `Shift note deleted for shift ID: ${shiftId} on ${shiftDate}`,
      })
      console.log("[v0] Audit log created successfully")
    } catch (auditError) {
      console.error("[v0] Error creating audit log:", auditError)
    }

    try {
      invalidateCache()
    } catch (cacheError) {
      console.error("[v0] Error invalidating cache:", cacheError)
    }

    return { success: true }
  } catch (error: any) {
    if (error?.code === "42P01") {
      return {
        success: false,
        error: "La table shift_notes n'existe pas encore. Veuillez exécuter le script SQL 023-create-shift-notes.sql",
      }
    }
    console.error("[v0] Error deleting shift note:", error)
    return { success: false, error: "Erreur lors de la suppression de la note" }
  }
}
