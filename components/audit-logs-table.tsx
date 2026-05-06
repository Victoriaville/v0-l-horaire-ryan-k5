"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface AuditLog {
  id: number
  user_id: number
  action_type: string
  table_name: string | null
  record_id: number | null
  old_values: any
  new_values: any
  description: string
  ip_address: string | null
  created_at: string
  first_name: string
  last_name: string
  email: string
}

interface AuditLogsTableProps {
  logs: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  allUsers?: Array<{
    id: number
    first_name: string
    last_name: string
    email: string
  }>
}

const actionTypeLabels: Record<string, string> = {
  ASSIGNMENT_CREATED: "Assignation créée",
  ASSIGNMENT_DELETED: "Assignation supprimée",
  SECOND_REPLACEMENT_ADDED: "Remplaçant 2 ajouté",
  REPLACEMENT_CREATED: "Demande créée",
  REPLACEMENT_APPROVED: "Candidature approuvée",
  REPLACEMENT_APPLICATION_ADDED: "Candidature ajoutée",
  REPLACEMENT_REJECTED: "Candidature rejetée",
  REPLACEMENT_REQUEST_APPROVED: "Demande approuvée",
  REPLACEMENT_REQUEST_REJECTED: "Demande rejetée",
  REPLACEMENT_ASSIGNED: "Remplacement assigné",
  REPLACEMENT_DELETED: "Demande supprimée",
  CANDIDATE_REMOVED: "Candidat retiré",
  EXCHANGE_CREATED: "Échange créé",
  EXCHANGE_APPROVED: "Échange approuvé",
  EXCHANGE_REJECTED: "Échange rejeté",
  EXCHANGE_CANCELLED: "Échange annulé",
  EXCHANGE_APPROVED_CANCELLED: "Échange approuvé annulé",
  USER_CREATED: "Pompier ajouté",
  USER_UPDATED: "Pompier modifié",
  USER_DELETED: "Pompier supprimé",
  USER_ROLE_UPDATED: "Rôle modifié",
  TEAM_CREATED: "Équipe créée",
  TEAM_MEMBER_ADDED: "Membre ajouté",
  TEAM_MEMBER_REMOVED: "Membre retiré",
  TEAM_MEMBERS_REORDERED: "Ordre réorganisé",
  LEAVE_CREATED: "Congé créé",
  LEAVE_APPROVED: "Congé approuvé",
  LEAVE_REJECTED: "Congé rejeté",
  LEAVE_UPDATED: "Congé modifié",
  LEAVE_DELETED: "Congé supprimé",
  SHIFT_CREATED: "Quart créé",
  SHIFT_DELETED: "Quart supprimé",
  SHIFT_UPDATED: "Quart modifié",
  FIREFIGHTER_ROLE_UPDATED: "Rôle pompier modifié",
  FIREFIGHTER_DELETED: "Pompier supprimé",
  ASSIGNMENT_CREATED: "Assignation créée",
  ASSIGNMENT_DELETED: "Assignation supprimée",
  SHIFT_NOTE_CREATED: "Note créée",
  SHIFT_NOTE_UPDATED: "Note modifiée",
  SHIFT_NOTE_DELETED: "Note supprimée",
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  PASSWORD_CHANGED_OWN: "Mot de passe changé",
  PASSWORD_RESET_ADMIN: "Réinitialisation de mot de passe",
  ADMIN_STATUS_CHANGED: "Changement du statut d'admin",
  OWNER_STATUS_CHANGED: "Changement du statut de propriétaire",
}

const actionTypeColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  ASSIGNMENT_CREATED: "default",
  ASSIGNMENT_DELETED: "destructive",
  SECOND_REPLACEMENT_ADDED: "secondary",
  REPLACEMENT_CREATED: "default",
  REPLACEMENT_APPROVED: "success",
  REPLACEMENT_APPLICATION_ADDED: "default",
  REPLACEMENT_REJECTED: "destructive",
  REPLACEMENT_REQUEST_APPROVED: "default",
  REPLACEMENT_REQUEST_REJECTED: "destructive",
  REPLACEMENT_ASSIGNED: "secondary",
  REPLACEMENT_DELETED: "destructive",
  CANDIDATE_REMOVED: "destructive",
  EXCHANGE_CREATED: "default",
  EXCHANGE_APPROVED: "default",
  EXCHANGE_REJECTED: "destructive",
  EXCHANGE_CANCELLED: "destructive",
  EXCHANGE_APPROVED_CANCELLED: "destructive",
  USER_CREATED: "default",
  USER_UPDATED: "secondary",
  USER_DELETED: "destructive",
  USER_ROLE_UPDATED: "secondary",
  TEAM_CREATED: "default",
  TEAM_MEMBER_ADDED: "secondary",
  TEAM_MEMBER_REMOVED: "destructive",
  TEAM_MEMBERS_REORDERED: "secondary",
  LEAVE_CREATED: "default",
  LEAVE_APPROVED: "default",
  LEAVE_REJECTED: "destructive",
  LEAVE_UPDATED: "secondary",
  LEAVE_DELETED: "destructive",
  SHIFT_CREATED: "default",
  SHIFT_DELETED: "destructive",
  SHIFT_UPDATED: "secondary",
  FIREFIGHTER_ROLE_UPDATED: "secondary",
  FIREFIGHTER_DELETED: "destructive",
  SHIFT_NOTE_CREATED: "default",
  SHIFT_NOTE_UPDATED: "secondary",
  SHIFT_NOTE_DELETED: "destructive",
  LOGIN: "default",
  LOGOUT: "secondary",
  PASSWORD_CHANGED_OWN: "secondary",
  PASSWORD_RESET_ADMIN: "secondary",
  ADMIN_STATUS_CHANGED: "secondary",
  OWNER_STATUS_CHANGED: "secondary",
}

export function AuditLogsTable({ logs, pagination, allUsers = [] }: AuditLogsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [sortField, setSortField] = useState<"created_at" | "user_name" | "action_type">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [openUserDropdown, setOpenUserDropdown] = useState(false)
  const [openActionDropdown, setOpenActionDropdown] = useState(false)
  
  // Initialize filters from searchParams
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => {
    const userIds = searchParams.getAll("userIds")
    return userIds.length > 0 ? userIds : []
  })
  const [selectedActionTypes, setSelectedActionTypes] = useState<string[]>(() => {
    const actionTypes = searchParams.getAll("actionTypes")
    return actionTypes.length > 0 ? actionTypes : []
  })

  // Use all action types from actionTypeLabels (not filtered by current logs)
  // Sort by French label in alphabetical order
  const allActionTypes = useMemo(() => {
    return Object.keys(actionTypeLabels).sort((a, b) => {
      const labelA = actionTypeLabels[a] || a
      const labelB = actionTypeLabels[b] || b
      return labelA.localeCompare(labelB, 'fr')
    })
  }, [])

  // Use all users passed from server (not filtered by current logs)
  const allUsersForDropdown = useMemo(() => {
    return allUsers.map((user) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    }))
  }, [allUsers])

  const processedLogs = useMemo(() => {
    let filtered = logs

    if (selectedActionTypes.length > 0) {
      filtered = filtered.filter((log) => selectedActionTypes.includes(log.action_type))
    }

    if (selectedUserIds.length > 0) {
      filtered = filtered.filter((log) => selectedUserIds.includes(log.user_id.toString()))
    }

    return filtered.sort((a, b) => {
      let compareResult = 0

      switch (sortField) {
        case "created_at":
          compareResult = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case "user_name":
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
          compareResult = nameA.localeCompare(nameB)
          break
        case "action_type":
          compareResult = a.action_type.localeCompare(b.action_type)
          break
      }

      return sortOrder === "asc" ? compareResult : -compareResult
    })
  }, [logs, sortField, sortOrder, selectedActionTypes, selectedUserIds])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    return new Intl.DateTimeFormat("fr-CA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Toronto",
    }).format(date)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/dashboard/admin/audit-logs?${params.toString()}`)
  }

  const handleSortChange = (field: "created_at" | "user_name" | "action_type") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const SortIcon = ({ field }: { field: "created_at" | "user_name" | "action_type" }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground inline" />
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4 inline" />
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Historique des actions ({pagination.total})</CardTitle>
            <CardDescription>
              Page {pagination.page} sur {pagination.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              {/* Utilisateur Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenUserDropdown(!openUserDropdown)}
                  className="px-3 py-2 border border-input rounded-md text-sm hover:bg-accent"
                >
                  Utilisateurs {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
                </button>
                {openUserDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 min-w-max max-h-64 overflow-y-auto">
                    {/* Tous/Aucun buttons */}
                    <div className="flex gap-2 px-3 py-2 border-b border-input">
                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          allUsersForDropdown.forEach(user => params.append("userIds", user.id.toString()))
                          selectedActionTypes.forEach(type => params.append("actionTypes", type))
                          params.set("page", "1")
                          router.push(`?${params.toString()}`)
                          setOpenUserDropdown(false)
                        }}
                        className="text-xs px-2 py-1 bg-muted hover:bg-accent rounded"
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          selectedActionTypes.forEach(type => params.append("actionTypes", type))
                          params.set("page", "1")
                          router.push(`?${params.toString()}`)
                          setOpenUserDropdown(false)
                        }}
                        className="text-xs px-2 py-1 bg-muted hover:bg-accent rounded"
                      >
                        Aucun
                      </button>
                    </div>
                    {allUsersForDropdown.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer whitespace-nowrap"
                      >
                        <Checkbox
                          checked={selectedUserIds.includes(user.id.toString())}
                          onCheckedChange={(checked) => {
                            const params = new URLSearchParams()
                            let newUserIds = [...selectedUserIds]
                            if (checked) {
                              newUserIds.push(user.id.toString())
                            } else {
                              newUserIds = newUserIds.filter(id => id !== user.id.toString())
                            }
                            newUserIds.forEach(id => params.append("userIds", id))
                            selectedActionTypes.forEach(type => params.append("actionTypes", type))
                            params.set("page", "1")
                            router.push(`?${params.toString()}`)
                          }}
                        />
                        <span className="text-sm">
                          {user.first_name} {user.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Type d'action Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenActionDropdown(!openActionDropdown)}
                  className="px-3 py-2 border border-input rounded-md text-sm hover:bg-accent"
                >
                  Actions {selectedActionTypes.length > 0 && `(${selectedActionTypes.length})`}
                </button>
                {openActionDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 min-w-max max-h-64 overflow-y-auto">
                    {/* Tous/Aucun buttons */}
                    <div className="flex gap-2 px-3 py-2 border-b border-input">
                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          selectedUserIds.forEach(id => params.append("userIds", id))
                          allActionTypes.forEach(type => params.append("actionTypes", type))
                          params.set("page", "1")
                          router.push(`?${params.toString()}`)
                          setOpenActionDropdown(false)
                        }}
                        className="text-xs px-2 py-1 bg-muted hover:bg-accent rounded"
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          selectedUserIds.forEach(id => params.append("userIds", id))
                          params.set("page", "1")
                          router.push(`?${params.toString()}`)
                          setOpenActionDropdown(false)
                        }}
                        className="text-xs px-2 py-1 bg-muted hover:bg-accent rounded"
                      >
                        Aucun
                      </button>
                    </div>
                    {allActionTypes.map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted cursor-pointer whitespace-nowrap"
                      >
                        <Checkbox
                          checked={selectedActionTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            const params = new URLSearchParams()
                            let newActionTypes = [...selectedActionTypes]
                            if (checked) {
                              newActionTypes.push(type)
                            } else {
                              newActionTypes = newActionTypes.filter(t => t !== type)
                            }
                            selectedUserIds.forEach(id => params.append("userIds", id))
                            newActionTypes.forEach(t => params.append("actionTypes", t))
                            params.set("page", "1")
                            router.push(`?${params.toString()}`)
                          }}
                        />
                        <span className="text-sm">
                          {actionTypeLabels[type] || type}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground ml-auto">
                {processedLogs.length} {processedLogs.length === 1 ? "action" : "actions"}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleSortChange("created_at")}
                        className="flex items-center font-semibold hover:text-foreground"
                      >
                        Date et heure
                        <SortIcon field="created_at" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSortChange("user_name")}
                        className="flex items-center font-semibold hover:text-foreground"
                      >
                        Utilisateur
                        <SortIcon field="user_name" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSortChange("action_type")}
                        className="flex items-center font-semibold hover:text-foreground"
                      >
                        Action
                        <SortIcon field="action_type" />
                      </button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Aucun log d'audit trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.first_name} {log.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">{log.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionTypeColors[log.action_type] || "default"}>
                            {actionTypeLabels[log.action_type] || log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-help hover:underline">{log.description}</span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-2xl bg-foreground text-background p-4">
                              <p className="break-words text-sm">{log.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <select
                    value={pagination.page}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <option key={pageNum} value={pageNum}>
                        {pageNum}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground">sur {pagination.totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedLog && (
          <Card>
            <CardHeader>
              <CardTitle>Détails du log</CardTitle>
              <CardDescription>Informations complètes sur cette action</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Utilisateur</div>
                <div className="mt-1">
                  {selectedLog.first_name} {selectedLog.last_name} ({selectedLog.email})
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date et heure</div>
                <div className="mt-1 font-mono text-sm">{formatDate(selectedLog.created_at)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Type d'action</div>
                <div className="mt-1">
                  <Badge variant={actionTypeColors[selectedLog.action_type] || "default"}>
                    {actionTypeLabels[selectedLog.action_type] || selectedLog.action_type}
                  </Badge>
                </div>
              </div>
              {selectedLog.ip_address && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Adresse IP</div>
                  <div className="mt-1 font-mono text-sm">{selectedLog.ip_address}</div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div className="mt-1">{selectedLog.description}</div>
            </div>

            {selectedLog.old_values && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Anciennes valeurs</div>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.old_values, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_values && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Nouvelles valeurs</div>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.new_values, null, 2)}
                </pre>
              </div>
            )}

            <Button variant="outline" onClick={() => setSelectedLog(null)} className="mt-4">
              Fermer les détails
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </TooltipProvider>
  )
}
