'use server'

import { getSession } from '@/app/actions/auth'
import { sql } from '@vercel/postgres'

export interface FirefighterExchangeCount {
  id: number
  first_name: string
  last_name: string
  years: Record<number, number>
}

export async function getExchangeCountReport() {
  try {
    const user = await getSession()
    if (!user || !user.is_admin) {
      return { error: 'Unauthorized' }
    }

    // Get all users and their exchange counts for all years
    const users = await sql`
      SELECT DISTINCT u.id, u.first_name, u.last_name
      FROM users u
      WHERE u.deleted_at IS NULL
      ORDER BY u.last_name, u.first_name
    `

    // For each user, get their exchange counts by year
    const firefighterCounts: FirefighterExchangeCount[] = []

    for (const user of users.rows) {
      const exchangesByYear = await sql`
        SELECT EXTRACT(YEAR FROM se.requester_shift_date)::int as year, COUNT(*) as count
        FROM shift_exchanges se
        WHERE se.requester_id = ${user.id}
        AND se.status = 'approved'
        GROUP BY EXTRACT(YEAR FROM se.requester_shift_date)
        ORDER BY year DESC
      `

      const yearsMap: Record<number, number> = {}
      for (const row of exchangesByYear.rows) {
        yearsMap[row.year] = Number(row.count)
      }

      firefighterCounts.push({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        years: yearsMap,
      })
    }

    // Get all years that have exchanges
    const allYears = await sql`
      SELECT DISTINCT EXTRACT(YEAR FROM requester_shift_date)::int as year
      FROM shift_exchanges
      WHERE status = 'approved'
      ORDER BY year DESC
    `

    const years = allYears.rows.map((row: any) => row.year as number)

    return {
      firefighters: firefighterCounts,
      years,
    }
  } catch (error: any) {
    console.error('[v0] Error getting exchange count report:', error)
    return { error: 'Failed to fetch data' }
  }
}
