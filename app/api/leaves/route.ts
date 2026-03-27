import { NextResponse } from "next/server"
import { getSession } from "@/app/actions/auth"
import { getAllLeaves, getUserLeaves } from "@/app/actions/leaves"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeFinished = searchParams.get("includeFinished") === "true"

    console.log("[v0] API /api/leaves called - includeFinished:", includeFinished, "isAdmin:", user.is_admin)

    const userLeaves = await getUserLeaves(user.id, includeFinished)
    const allLeaves = user.is_admin ? await getAllLeaves(includeFinished) : []

    console.log("[v0] API returning - userLeaves:", userLeaves.length, "allLeaves:", allLeaves.length)

    return NextResponse.json({ userLeaves, allLeaves })
  } catch (error) {
    console.log("[v0] API /api/leaves error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
