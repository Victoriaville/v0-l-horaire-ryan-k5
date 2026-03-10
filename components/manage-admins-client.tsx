"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toggleUserAdminStatus, toggleUserOwnerStatus } from "@/app/actions/admin"
import { useRouter } from "next/navigation"
import { User, ShieldCheck, Key } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserWithAdminStatus {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  is_admin: boolean
  is_owner?: boolean
  isAdmin: boolean
  isOwner?: boolean
  canModifyAdmin: boolean
  created_at: string
}

interface ManageAdminsClientProps {
  users: UserWithAdminStatus[]
  currentUserIsOwner?: boolean
}

const roleLabels: Record<string, string> = {
  captain: "Capitaine",
  lieutenant: "Lieutenant",
  firefighter: "Pompier",
}

const roleColors: Record<string, string> = {
  captain: "bg-blue-100 text-blue-800",
  lieutenant: "bg-green-100 text-green-800",
  firefighter: "bg-gray-100 text-gray-800",
}

export function ManageAdminsClient({ users, currentUserIsOwner = false }: ManageAdminsClientProps) {
  const router = useRouter()
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null)
  const [loadingOwnerUserId, setLoadingOwnerUserId] = useState<number | null>(null)

  // Sort users by role (captains first) then by name
  const sortedUsers = users.sort((a, b) => {
    if (a.role === "captain" && b.role !== "captain") return -1
    if (a.role !== "captain" && b.role === "captain") return 1
    return a.last_name.localeCompare(b.last_name)
  })

  const handleToggleAdmin = async (userId: number, currentIsAdmin: boolean) => {
    setLoadingUserId(userId)

    try {
      const result = await toggleUserAdminStatus(userId, !currentIsAdmin)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Erreur lors de la modification")
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleToggleOwner = async (userId: number, currentIsOwner: boolean) => {
    setLoadingOwnerUserId(userId)

    try {
      const result = await toggleUserOwnerStatus(userId, !currentIsOwner)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Erreur lors de la modification")
    } finally {
      setLoadingOwnerUserId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Gestion des administrateurs
          </CardTitle>
          <CardDescription>Activez ou désactivez les privilèges administrateurs pour chaque utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {user.isOwner && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Key className="h-6 w-6 text-amber-500 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Propriétaire</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Badge className={roleColors[user.role]}>{roleLabels[user.role] || user.role}</Badge>
                  {currentUserIsOwner && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.isOwner ? "Propriétaire" : "Non propriétaire"}</span>
                      <Switch
                        checked={user.isOwner || false}
                        onCheckedChange={() => handleToggleOwner(user.id, user.isOwner || false)}
                        disabled={loadingOwnerUserId === user.id}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.isAdmin ? "Admin" : "Non admin"}</span>
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                      disabled={loadingUserId === user.id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
