import { Suspense } from "react"
import { NotificationHistoryList } from "@/components/notification-history-list"
import { getNotificationErrorsCount } from "@/app/actions/get-notification-history"
import { AcknowledgeAllErrorsButton } from "@/components/acknowledge-all-errors-button"

export default async function NotificationHistoryPage() {
  const { count: errorCount } = await getNotificationErrorsCount()

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historique des notifications</h1>
          <p className="text-muted-foreground mt-2">
            Consultez l'historique complet de toutes les notifications envoyées avec leurs détails de livraison.
          </p>
        </div>
        {errorCount > 0 && (
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
              {errorCount} erreur{errorCount > 1 ? "s" : ""} non traitée{errorCount > 1 ? "s" : ""}
            </div>
            <AcknowledgeAllErrorsButton errorCount={errorCount} />
          </div>
        )}
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border p-8 text-center text-muted-foreground">Chargement de l'historique...</div>
        }
      >
        <NotificationHistoryList />
      </Suspense>
    </div>
  )
}
