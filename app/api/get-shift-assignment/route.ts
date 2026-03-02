import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { shiftId, userId, shiftDate } = await request.json()

    console.log("[v0] get-shift-assignment API called:", { shiftId, userId, shiftDate })

    if (!shiftId || !userId || !shiftDate) {
      console.log("[v0] get-shift-assignment - Missing parameters")
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const result = await sql`
      SELECT is_acting_lieutenant, is_acting_captain
      FROM shift_assignments
      WHERE shift_id = ${shiftId} 
        AND user_id = ${userId}
        AND DATE(shift_date) = ${shiftDate}
      LIMIT 1
    `

    console.log("[v0] get-shift-assignment - Query result:", result)

    if (result.length === 0) {
      console.log("[v0] get-shift-assignment - No result found, returning false")
      return NextResponse.json({
        is_acting_lieutenant: false,
        is_acting_captain: false,
      })
    }

    console.log("[v0] get-shift-assignment - Found result:", {
      is_acting_lieutenant: result[0].is_acting_lieutenant,
      is_acting_captain: result[0].is_acting_captain,
    })

    return NextResponse.json({
      is_acting_lieutenant: result[0].is_acting_lieutenant || false,
      is_acting_captain: result[0].is_acting_captain || false,
    })
  } catch (error) {
    console.error("[v0] get-shift-assignment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
