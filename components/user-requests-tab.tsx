"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { parseLocalDate, formatShortDate } from "@/lib/date-utils"
import { getShiftTypeColor, getShiftTypeLabel } from "@/lib/colors"
import { compareShifts } from "@/lib/shift-sort"
import { formatLeaveBanks } from "@/lib/replacement-utils"

interface UserRequestsTabProps {
  userRequests: any[]
  userId: number
}

export function UserRequestsTab({ userRequests, userId }: UserRequestsTabProps) {
  const [showPastRequests, setShowPastRequests] = useState(false)

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Disponible"
      case "assigned":
        return "Assigné"
      case "pending":
        return "En attente"
      case "completed":
        return "Complété"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "assigned":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter requests by future date (>= today) or all if showing past
  const filteredRequests = showPastRequests
    ? userRequests
    : userRequests.filter((request) => {
        const shiftDate = parseLocalDate(request.shift_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return shiftDate >= today
      })

  const sortedRequests = [...filteredRequests].sort((a, b) => compareShifts(a, b, parseLocalDate))

  return (
    <div className="space-y-0.5">
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPastRequests(!showPastRequests)}
          className="gap-2"
        >
          {showPastRequests ? (
            <>
              <EyeOff className="h-4 w-4" />
              Masquer les demandes passées
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Afficher les demandes passées
            </>
          )}
        </Button>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {showPastRequests
                ? "Vous n'avez pas encore demandé de remplacement"
                : "Vous n'avez aucune demande à venir"}
            </p>
          </CardContent>
        </Card>
      ) : (
        sortedRequests.map((request: any) => (
          <Card key={request.id} className="overflow-hidden">
            <CardContent className="py-0 px-1.5">
              {/* Desktop layout */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                {/* Date and shift type */}
                <div className="flex items-center gap-1.5 min-w-[140px]">
                  <span className="font-medium leading-none">{formatShortDate(request.shift_date)}</span>
                  <Badge className={`${getShiftTypeColor(request.shift_type)} text-sm px-1.5 py-0 h-5 leading-none`}>
                    {getShiftTypeLabel(request.shift_type).split(" ")[0]}
                  </Badge>
                  {request.is_partial && (
                    <Badge variant="outline" className="text-sm px-1.5 py-0 h-5 leading-none">
                      {request.start_time?.slice(0, 5)}-{request.end_time?.slice(0, 5)}
                    </Badge>
                  )}
                </div>

                {/* Name and leave banks */}
                <div className="flex-1 min-w-0 leading-none truncate">
                  {request.first_name} {request.last_name}
                  {request.leave_bank_1 && <span> • {formatLeaveBanks(request.leave_bank_1, request.leave_hours_1, request.leave_bank_2, request.leave_hours_2)}</span>}
                </div>

                {request.status === "assigned" && request.assigned_first_name && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 shrink-0 leading-none">
                    → {request.assigned_first_name} {request.assigned_last_name}
                  </div>
                )}

                {/* Status badge */}
                <Badge className={`${getStatusColor(request.status)} text-sm px-1.5 py-0 h-5 leading-none`}>
                  {getStatusLabel(request.status)}
                </Badge>
              </div>

              {/* Mobile layout: 2 columns - Left (Date/Info) + Right (Status + Button) */}
              <div className="md:hidden flex gap-1 items-center py-2">
                {/* Left column: Date + Names/Team (2 lines) */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  {/* Line 1: Date + Shift badge + Partial info */}
                  <div className="flex items-center gap-0.5">
                    <span className="font-medium text-xs leading-tight">{formatShortDate(request.shift_date)}</span>
                    <Badge className={`${getShiftTypeColor(request.shift_type)} text-xs px-1 py-0 h-4 leading-none`}>
                      {getShiftTypeLabel(request.shift_type).split(" ")[0]}
                    </Badge>
                    {request.is_partial && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4 leading-none">
                        {request.start_time?.slice(0, 5)}-{request.end_time?.slice(0, 5)}
                      </Badge>
                    )}
                  </div>

                  {/* Line 2: Name • Leave Bank 1 */}
                  <div className="text-xs leading-tight truncate">
                    {request.first_name} {request.last_name}
                    {request.leave_bank_1 && (
                      <span> • {formatLeaveBanks(request.leave_bank_1, request.leave_hours_1)}</span>
                    )}
                  </div>

                  {/* Line 3: Leave Bank 2 (if exists) */}
                  {request.leave_bank_2 && (
                    <div className="text-xs leading-tight truncate">
                      {formatLeaveBanks(request.leave_bank_2, request.leave_hours_2)}
                    </div>
                  )}
                </div>

                {/* Right column: Status badge + assigned info (vertically centered, no shrink) */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <div className="flex flex-col items-end gap-0.5">
                    <Badge className={`${getStatusColor(request.status)} text-xs px-1 py-0 h-4 leading-none`}>
                      {getStatusLabel(request.status)}
                    </Badge>
                    {request.status === "assigned" && request.assigned_first_name && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 leading-tight">
                        → {request.assigned_first_name.slice(0, 1)}. {request.assigned_last_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
