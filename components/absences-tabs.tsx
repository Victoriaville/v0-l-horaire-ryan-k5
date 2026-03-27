"use client"

import { useState } from "react"
import useSWR from "swr"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Plus } from "lucide-react"
import { AddAbsenceDialog } from "@/components/add-absence-dialog"
import { EditLeaveButton } from "@/components/edit-leave-button"
import { DeleteLeaveButton } from "@/components/delete-leave-button"
import { ApproveLeaveButton } from "@/components/approve-leave-button"
import { RejectLeaveButton } from "@/components/reject-leave-button"
import { parseLocalDate, formatLocalDateTime } from "@/lib/date-utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface AbsencesTabsProps {
  firefighters: any[]
  isAdmin: boolean
  userId: number
  initialTab?: string
}

export function AbsencesTabs({
  firefighters,
  isAdmin,
  userId,
  initialTab = "all",
}: AbsencesTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showFinished, setShowFinished] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data, mutate } = useSWR(
    `/api/leaves?includeFinished=${showFinished}`,
    fetcher
  )

  console.log("[v0] AbsencesTabs rendered - isAdmin:", isAdmin, "showFinished:", showFinished)
  console.log("[v0] SWR data:", data)

  const userLeaves = data?.userLeaves ?? []
  const allLeaves = data?.allLeaves ?? []

  const leavesToDisplay = isAdmin ? allLeaves : userLeaves

  console.log("[v0] leavesToDisplay count:", leavesToDisplay.length)

  const pendingLeaves = leavesToDisplay.filter((l: any) => l.status === "pending")
  const approvedLeaves = leavesToDisplay.filter((l: any) => l.status === "approved")
  const rejectedLeaves = leavesToDisplay.filter((l: any) => l.status === "rejected")

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

  const renderLeaveCard = (leave: any) => {
    const startDate = parseLocalDate(leave.start_date).toLocaleDateString("fr-CA")
    const endDate = parseLocalDate(leave.end_date).toLocaleDateString("fr-CA")

    return (
      <Card key={leave.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {isAdmin && `${leave.first_name} ${leave.last_name} - `}
                {startDate} au {endDate}
              </CardTitle>
              {leave.reason && <p className="text-sm text-muted-foreground mt-1">{leave.reason}</p>}
              <p className="text-xs text-muted-foreground mt-2">Créée le {formatLocalDateTime(leave.created_at)}</p>
            </div>
            <Badge className={getStatusColor(leave.status)}>{getStatusLabel(leave.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {leave.status === "pending" && <p>En attente d'approbation</p>}
              {leave.status === "approved" && leave.approver_first_name && (
                <p>
                  Approuvée par {leave.approver_first_name} {leave.approver_last_name} le{" "}
                  {parseLocalDate(leave.approved_at).toLocaleDateString("fr-CA")}
                </p>
              )}
              {leave.status === "rejected" && leave.approver_first_name && (
                <p>
                  Rejetée par {leave.approver_first_name} {leave.approver_last_name} le{" "}
                  {parseLocalDate(leave.approved_at).toLocaleDateString("fr-CA")}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {isAdmin && leave.status === "pending" && (
                <>
                  <ApproveLeaveButton leaveId={leave.id} />
                  <RejectLeaveButton leaveId={leave.id} />
                </>
              )}
              {(leave.user_id === userId || isAdmin) && (
                <DeleteLeaveButton leaveId={leave.id} status={leave.status} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderLeavesList = (leaves: any[]) => {
    if (leaves.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucune absence</p>
          </CardContent>
        </Card>
      )
    }

    return <div className="grid gap-4">{leaves.map(renderLeaveCard)}</div>
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une absence
        </Button>
      </div>

      <TabsList>
        <TabsTrigger value="all">Toutes ({leavesToDisplay.length})</TabsTrigger>
        {isAdmin && (
          <TabsTrigger
            value="pending"
            className={
              pendingLeaves.length > 0
                ? "data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=inactive]:text-red-600 data-[state=inactive]:font-semibold"
                : ""
            }
          >
            En attente ({pendingLeaves.length})
          </TabsTrigger>
        )}
        <TabsTrigger value="approved">Approuvées ({approvedLeaves.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejetées ({rejectedLeaves.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("[v0] Button clicked! showFinished changing from:", showFinished, "to:", !showFinished)
              setShowFinished(!showFinished)
            }}
            className="gap-2"
          >
            {showFinished ? (
              <>
                <EyeOff className="h-4 w-4" />
                Masquer les absences terminées
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Afficher les absences terminées
              </>
            )}
          </Button>
        </div>
        {renderLeavesList(leavesToDisplay)}
      </TabsContent>

      {isAdmin && <TabsContent value="pending">{renderLeavesList(pendingLeaves)}</TabsContent>}

      <TabsContent value="approved">{renderLeavesList(approvedLeaves)}</TabsContent>

      <TabsContent value="rejected">{renderLeavesList(rejectedLeaves)}</TabsContent>

      <AddAbsenceDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) mutate()
        }}
        isAdmin={isAdmin}
        firefighters={firefighters}
        userId={userId}
      />
    </Tabs>
  )
}
