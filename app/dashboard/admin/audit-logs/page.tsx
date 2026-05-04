import { getAuditLogs } from "@/app/actions/audit"
import { AuditLogsTable } from "@/components/audit-logs-table"
import { RefreshOnFocus } from "@/components/refresh-on-focus"
import { db } from "@vercel/postgres"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; userId?: string; actionType?: string }
}) {
  const page = Number.parseInt(searchParams.page || "1")
  const userId = searchParams.userId ? Number.parseInt(searchParams.userId) : undefined
  const actionType = searchParams.actionType as any

  const { logs, pagination } = await getAuditLogs({
    page,
    userId,
    actionType,
  })

  // Fetch all users for the dropdown
  const allUsersData = await db`
    SELECT id, first_name, last_name, email
    FROM users
    ORDER BY first_name, last_name
  `

  const allUsers = allUsersData.map(user => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  }))

  return (
    <div className="container mx-auto p-6">
      <RefreshOnFocus />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Journal d'activités</h1>
        <p className="text-muted-foreground mt-2">
          Consultez l'historique complet de toutes les actions effectuées dans l'application. Les logs sont conservés
          pendant 1 an.
        </p>
      </div>

      <AuditLogsTable logs={logs} pagination={pagination} allUsers={allUsers} />
    </div>
  )
}
