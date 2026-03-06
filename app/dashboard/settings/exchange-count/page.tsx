import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { getExchangeCountReport } from '@/app/actions/exchange-count-report'
import { ExchangeCountReport } from '@/components/exchange-count-report'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const dynamic = 'force-dynamic'

export default async function ExchangeCountPage() {
  const user = await getSession()

  if (!user) {
    redirect('/login')
  }

  if (!user.is_admin) {
    redirect('/dashboard')
  }

  const result = await getExchangeCountReport()

  if (result.error) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Nombre d'échange</h1>
        <Alert variant="destructive">
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { firefighters, years } = result

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Nombre d'échange</h1>
        <p className="text-muted-foreground">
          Consulter le nombre d'échanges approuvés pour chaque pompier par année civile
        </p>
      </div>

      <ExchangeCountReport firefighters={firefighters} years={years} />
    </div>
  )
}
