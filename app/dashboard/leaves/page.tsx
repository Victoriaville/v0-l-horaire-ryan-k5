import { getSession } from "@/app/actions/auth"
import { getAllFirefighters } from "@/app/actions/users"
import { redirect } from "next/navigation"
import { AbsencesTabs } from "@/components/absences-tabs"

export const dynamic = "force-dynamic"

export default async function LeavesPage() {
  const user = await getSession()
  if (!user) redirect("/login")

  const firefighters = user.is_admin ? await getAllFirefighters() : []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Absences</h1>
        <p className="text-muted-foreground">
          {user.is_admin ? "Gérez les absences des pompiers" : "Gérez vos absences"}
        </p>
      </div>

      <AbsencesTabs
        firefighters={firefighters}
        isAdmin={user.is_admin}
        userId={user.id}
      />
    </div>
  )
}
