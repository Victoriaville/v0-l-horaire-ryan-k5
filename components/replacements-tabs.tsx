"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Plus } from "lucide-react"
import { AvailableReplacementsTab } from "@/components/available-replacements-tab"
import { DirectAssignmentsTab } from "@/components/direct-assignments-tab"
import { PendingRequestsTab } from "@/components/pending-requests-tab"
import { UserRequestsTab } from "@/components/user-requests-tab"
import { WithdrawApplicationButton } from "@/components/withdraw-application-button"
import { RequestReplacementDialog } from "@/components/request-replacement-dialog"
import { ExpiredReplacementsTab } from "@/components/expired-replacements-tab"
import { AssignedReplacementsTab } from "@/components/assigned-replacements-tab"
import { parseLocalDate, formatLocalDateTime, formatShortDate } from "@/lib/date-utils"
import { getShiftTypeColor, getShiftTypeLabel } from "@/lib/colors"
import { compareShifts } from "@/lib/shift-sort"
import { PartTimeTeamBadge } from "@/components/part-time-team-badge"

interface ReplacementsTabsProps {
  recentReplacements: any[]
  userApplications: any[]
  allReplacements: any[]
  firefighters: any[]
  pendingRequests: any[]
  userRequests: any[]
  expiredReplacements: any[]
  directAssignments: any[]
  assignedReplacements: any[]
  assignedUnsentCount: number // Added unsent count prop
  assignedUnconfirmedCount: number // Added unconfirmed count prop
  isAdmin: boolean
  userId: number
  initialTab?: string
}

export function ReplacementsTabs({
  recentReplacements,
  userApplications,
  allReplacements,
  firefighters,
  pendingRequests,
  userRequests,
  expiredReplacements,
  directAssignments,
  assignedReplacements,
  assignedUnsentCount, // Added unsent count
  assignedUnconfirmedCount, // Added unconfirmed count
  isAdmin,
  userId,
  initialTab = "available",
}: ReplacementsTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showCompletedApplications, setShowCompletedApplications] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "approved":
        return "Approuvée"
      case "rejected":
        return "Rejetée"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const sortReplacements = (replacements: any[]) => {
    const sorted = [...replacements]
    sorted.sort((a, b) => compareShifts(a, b, parseLocalDate))
    return sorted
  }

  const groupByShift = (replacements: any[]) => {
    const groups: Record<string, any[]> = {}
    replacements.forEach((replacement) => {
      const date = parseLocalDate(replacement.shift_date)
      const dateStr = date.toISOString().split("T")[0]
      const key = `${dateStr}_${replacement.shift_type}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(replacement)
    })
    return groups
  }

  const replacementsToDisplay = isAdmin ? allReplacements : recentReplacements

  const openReplacements = replacementsToDisplay.filter((r) => {
    if (r.status !== "open") return false
    const isExpired = r.application_deadline && new Date(r.application_deadline) < new Date()
    return !isExpired
  })
  const assignedReplacementsList = replacementsToDisplay.filter((r) => r.status === "assigned")
  const pendingApplications = userApplications.filter((app: any) => app.status === "pending")

  const sortedOpenReplacements = sortReplacements(openReplacements)
  const groupedOpenReplacements = groupByShift(sortedOpenReplacements)

  const filteredApplications = showCompletedApplications
    ? userApplications
    : userApplications.filter((app: any) => app.status === "pending")

  const getAssignedBadge = () => {
    const total = assignedUnsentCount + assignedUnconfirmedCount
    if (total > 0) {
      return `[${total}]`
    }
    return ""
  }

  const getAssignedBadgeColor = () => {
    if (assignedUnsentCount > 0) {
      return "data-[state=inactive]:text-red-600 data-[state=inactive]:font-semibold"
    } else if (assignedUnconfirmedCount > 0) {
      return "data-[state=inactive]:text-orange-600 data-[state=inactive]:font-semibold"
    }
    return ""
  }

  const badgeText = getAssignedBadge()

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setShowRequestDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Demander un remplacement
        </Button>
      </div>

      <TabsList className="flex flex-col md:flex-row w-full md:w-auto gap-1 md:gap-0 h-auto md:h-10">
        <TabsTrigger value="available" className="justify-start md:justify-center w-full md:w-auto">Remplacements disponibles ({openReplacements.length})</TabsTrigger>
        {isAdmin && (
          <TabsTrigger
            value="to-assign"
            className={`justify-start md:justify-center w-full md:w-auto ${
              expiredReplacements.length > 0
                ? "data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=inactive]:text-red-600 data-[state=inactive]:font-semibold"
                : ""
            }`}
          >
            Prêts à assigner ({expiredReplacements.length})
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="assigned" className={`justify-start md:justify-center w-full md:w-auto ${getAssignedBadgeColor()}`}>
            Remplacements assignés {badgeText}
          </TabsTrigger>
        )}
        {isAdmin && (
          <TabsTrigger value="direct-assignments" className="justify-start md:justify-center w-full md:w-auto">Assignations directes ({directAssignments.length})</TabsTrigger>
        )}
        <TabsTrigger value="my-applications" className="justify-start md:justify-center w-full md:w-auto">Mes candidatures ({pendingApplications.length})</TabsTrigger>
        <TabsTrigger value="my-requests" className="justify-start md:justify-center w-full md:w-auto">Mes demandes ({userRequests.length})</TabsTrigger>
        {isAdmin && (
          <TabsTrigger
            value="pending"
            className={`justify-start md:justify-center w-full md:w-auto ${
              pendingRequests.length > 0
                ? "data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=inactive]:text-red-600 data-[state=inactive]:font-semibold"
                : ""
            }`}
          >
            Demandes en attente ({pendingRequests.length})
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="available">
        <AvailableReplacementsTab
          groupedReplacements={groupedOpenReplacements}
          allReplacements={replacementsToDisplay}
          userApplications={userApplications}
          isAdmin={isAdmin}
          firefighters={firefighters}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="direct-assignments">
        <DirectAssignmentsTab directAssignments={directAssignments} isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="my-applications" className="space-y-0.5">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompletedApplications(!showCompletedApplications)}
            className="gap-2"
          >
            {showCompletedApplications ? (
              <>
                <EyeOff className="h-4 w-4" />
                Masquer les candidatures traitées
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Afficher les candidatures traitées
              </>
            )}
          </Button>
        </div>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {showCompletedApplications
                  ? "Vous n'avez pas encore postulé pour des remplacements"
                  : "Vous n'avez aucune candidature en attente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications
            .sort((a: any, b: any) => compareShifts(a, b, parseLocalDate))
            .map((application: any) => (
              <Card key={application.id} className="overflow-hidden">
                <CardContent className="py-0 px-1.5">
                  {/* Desktop layout */}
                  <div className="hidden md:flex items-center gap-2 text-sm py-2">
                    {/* Date and shift type */}
                    <div className="flex items-center gap-1.5 min-w-[140px]">
                      <span className="font-medium leading-none">{formatShortDate(application.shift_date)}</span>
                      <Badge
                        className={`${getShiftTypeColor(application.shift_type)} text-sm px-1.5 py-0 h-5 leading-none`}
                      >
                        {getShiftTypeLabel(application.shift_type).split(" ")[0]}
                      </Badge>
                      <PartTimeTeamBadge shiftDate={application.shift_date} />
                    </div>

                    {/* Name and team */}
                    <div className="flex-1 min-w-0 leading-none truncate">
                      {application.first_name} {application.last_name} • {application.team_name}
                      {application.is_partial && (
                        <span className="text-orange-600 dark:text-orange-400 ml-1 text-xs">
                          ({application.start_time?.slice(0, 5)}-{application.end_time?.slice(0, 5)})
                        </span>
                      )}
                    </div>

                    {/* Assigned replacement firefighter name */}
                    {application.replacement_status === "assigned" && application.assigned_first_name && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 shrink-0 leading-none">
                        → {application.assigned_first_name} {application.assigned_last_name}
                      </div>
                    )}

                    {/* Status badge */}
                    <Badge className={`${getStatusColor(application.status)} text-sm px-1.5 py-0 h-5 leading-none`}>
                      {getStatusLabel(application.status)}
                    </Badge>

                    {/* Applied date */}
                    <div className="text-[10px] text-muted-foreground leading-none shrink-0">
                      {formatLocalDateTime(application.applied_at)}
                    </div>

                    {/* Withdraw button */}
                    {application.status === "pending" && application.replacement_status === "open" && (
                      <WithdrawApplicationButton
                        applicationId={application.id}
                        shiftDate={application.shift_date}
                        shiftType={application.shift_type}
                      />
                    )}
                  </div>

                  {/* Mobile layout: 2 columns - Left (Date/Info) + Right (Status + Button) */}
                  <div className="md:hidden flex gap-1 items-start py-2">
                    {/* Left column: Date + Names/Team + Partial info (3 lines) */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      {/* Line 1: Date + Shift badge + PartTime badge */}
                      <div className="flex items-center gap-0.5">
                        <span className="font-medium text-xs leading-tight">{formatShortDate(application.shift_date)}</span>
                        <Badge className={`${getShiftTypeColor(application.shift_type)} text-xs px-1 py-0 h-4 leading-none`}>
                          {getShiftTypeLabel(application.shift_type).split(" ")[0]}
                        </Badge>
                        <PartTimeTeamBadge shiftDate={application.shift_date} />
                      </div>

                      {/* Line 2: First Name • Team (or "Name • Team") */}
                      <div className="text-xs leading-tight truncate">
                        {application.first_name} • {application.team_name}
                      </div>

                      {/* Line 3: Partial info if applicable */}
                      {application.is_partial && (
                        <div className="text-xs text-orange-600 dark:text-orange-400 leading-tight">
                          {application.start_time?.slice(0, 5)}-{application.end_time?.slice(0, 5)}
                        </div>
                      )}
                    </div>

                    {/* Right column: Status badge + Assigned info + Button (vertically stacked, no shrink) */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge className={`${getStatusColor(application.status)} text-xs px-1 py-0 h-4 leading-none`}>
                        {getStatusLabel(application.status)}
                      </Badge>

                      {/* Assigned replacement firefighter name */}
                      {application.replacement_status === "assigned" && application.assigned_first_name && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 leading-tight">
                          → {application.assigned_first_name.slice(0, 1)}. {application.assigned_last_name}
                        </div>
                      )}

                      {/* Withdraw button */}
                      {application.status === "pending" && application.replacement_status === "open" && (
                        <WithdrawApplicationButton
                          applicationId={application.id}
                          shiftDate={application.shift_date}
                          shiftType={application.shift_type}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </TabsContent>

      <TabsContent value="my-requests">
        <UserRequestsTab userRequests={userRequests} userId={userId} />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="to-assign">
          <ExpiredReplacementsTab
            expiredReplacements={expiredReplacements}
            allReplacements={allReplacements}
            isAdmin={isAdmin}
            firefighters={firefighters}
          />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="assigned">
          <AssignedReplacementsTab assignedReplacements={assignedReplacements} unsentCount={assignedUnsentCount} />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="pending">
          <PendingRequestsTab pendingRequests={pendingRequests} />
        </TabsContent>
      )}

      <RequestReplacementDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} userId={userId} />
    </Tabs>
  )
}
