"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updateUserPreferences } from "@/app/actions/notifications"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NotificationPreferencesFormProps {
  userId: number
  initialPreferences: any
}

export function NotificationPreferencesForm({ userId, initialPreferences }: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] = useState({
    enable_app: initialPreferences?.enable_app ?? true,
    enable_email: initialPreferences?.enable_email ?? false,
    notify_replacement_available: true,
    notify_replacement_accepted: true,
    notify_replacement_rejected: initialPreferences?.notify_replacement_rejected ?? false,
  })

  const [savingToggles, setSavingToggles] = useState<Set<string>>(new Set())

  const handleToggle = async (key: string, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)

    setSavingToggles((prev) => new Set(prev).add(key))

    await updateUserPreferences(userId, newPreferences)

    setTimeout(() => {
      setSavingToggles((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }, 500)
  }



  return (
    <div className="space-y-6">
      {/* Channels */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Canaux de notification</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choisissez comment vous souhaitez recevoir vos notifications
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3 flex-1">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="enable-app" className="text-base font-medium">
                  Notifications dans l'application
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recevez les notifications dans l'interface de l'application
                </p>
              </div>
            </div>
            <Switch
              id="enable-app"
              checked={preferences.enable_app}
              onCheckedChange={(value) => handleToggle("enable_app", value)}
              disabled={savingToggles.has("enable_app")}
            />
          </div>
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Types de notifications</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choisissez les événements pour lesquels vous souhaitez être notifié
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label className="text-base font-medium">
                  Remplacements disponibles{" "}
                  <span className="text-muted-foreground font-normal">(24h et 15 minutes)</span>
                </Label>
                <Badge variant="outline" className="text-xs">
                  Obligatoire
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Quand un nouveau remplacement est publié</p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Toujours activé</Badge>
          </div>

          <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label className="text-base font-medium">Remplacement accepté</Label>
                <Badge variant="outline" className="text-xs">
                  Obligatoire
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Quand votre candidature est acceptée</p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Toujours activé</Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex-1">
              <Label htmlFor="notify-rejected" className="text-base font-medium">
                Remplacement refusé
              </Label>
              <p className="text-sm text-muted-foreground">Quand votre candidature est refusée</p>
            </div>
            <Switch
              id="notify-rejected"
              checked={preferences.notify_replacement_rejected}
              onCheckedChange={(value) => handleToggle("notify_replacement_rejected", value)}
              disabled={savingToggles.has("notify_replacement_rejected")}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
