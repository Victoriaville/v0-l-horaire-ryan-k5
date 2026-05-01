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

    // Get shift details for logging
    const shiftDetails = await sql`
      SELECT s.shift_type, s.start_time, s.end_time
      FROM shifts s
      WHERE s.id = ${shiftId}
    `

    if (shiftDetails.length === 0) {
      return { success: false, error: "Shift non trouvé" }
    }

    const { shift_type } = shiftDetails[0]
    const shiftTypeLabel = shift_type === "day" ? "Jour" : (shift_type === "night" ? "Nuit" : "24h")
    const formattedDate = formatLocalDate(shiftDate)

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
    const notePreview = note.trim().substring(0, 100)
    const noteFullPreview = note.trim().length > 100 ? notePreview + "..." : notePreview
    
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
      description: `Note de quart ${isUpdate ? "modifiée" : "créée"} le ${formattedDate} (${shiftTypeLabel}): "${noteFullPreview}"`,
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

    // Get note and shift details BEFORE deletion for logging
    const noteData = await sql`
      SELECT sn.id, sn.note, s.shift_type
      FROM shift_notes sn
      JOIN shifts s ON sn.shift_id = s.id
      WHERE sn.shift_id = ${shiftId} AND sn.shift_date = ${shiftDate}
    `

    if (noteData.length === 0) {
      return { success: false, error: "Note introuvable" }
    }

    const { note: noteContent, shift_type } = noteData[0]
    const shiftTypeLabel = shift_type === "day" ? "Jour" : (shift_type === "night" ? "Nuit" : "24h")
    const formattedDate = formatLocalDate(shiftDate)

    await sql`
      DELETE FROM shift_notes 
      WHERE shift_id = ${shiftId} AND shift_date = ${shiftDate}
    `

    // Log the shift note deletion
    try {
      const notePreview = noteContent.substring(0, 100)
      const noteFullPreview = noteContent.length > 100 ? notePreview + "..." : notePreview
      
      await createAuditLog({
        userId: session.id,
        actionType: "SHIFT_NOTE_DELETED",
        tableName: "shift_notes",
        recordId: shiftId,
        oldValues: { note: noteContent },
        newValues: null,
        description: `Note de quart supprimée le ${formattedDate} (${shiftTypeLabel}). Contenu: "${noteFullPreview}"`,
      })
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
