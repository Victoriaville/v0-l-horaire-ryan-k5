import { getAuditLogs } from "@/app/actions/audit"
import { AuditLogsTable } from "@/components/audit-logs-table"
import { RefreshOnFocus } from "@/components/refresh-on-focus"
import { db } from "@vercel/postgres"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; userIds?: string | string[]; actionTypes?: string | string[] }
}) {
  const page = Number.parseInt(searchParams.page || "1")
  
  // Parse userIds (can be single string or array)
  const userIdsParam = searchParams.userIds
  const userIds = userIdsParam 
    ? Array.isArray(userIdsParam) 
      ? userIdsParam.map(id => Number.parseInt(id))
      : [Number.parseInt(userIdsParam)]
    : undefined

  // Parse actionTypes (can be single string or array)
  const actionTypesParam = searchParams.actionTypes
  const actionTypes = actionTypesParam
    ? Array.isArray(actionTypesParam)
      ? actionTypesParam
      : [actionTypesParam]
    : undefined

  const { logs, pagination } = await getAuditLogs({
    page,
    userIds,
    actionTypes,
  })

  // Fetch all users for the dropdown
  const allUsersResult = await db`
    SELECT id, first_name, last_name, email
    FROM users
    ORDER BY first_name, last_name
  `

  const allUsers = (allUsersResult as any).rows?.map((user: any) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  })) || []

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
