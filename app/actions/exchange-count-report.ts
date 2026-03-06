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

    // Get all users with their exchange counts by year in a SINGLE query
    const data = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        EXTRACT(YEAR FROM se.requester_shift_date)::int as year,
        COUNT(se.id) as count
      FROM users u
      LEFT JOIN shift_exchanges se ON u.id = se.requester_id AND se.status = 'approved'
      GROUP BY u.id, u.first_name, u.last_name, EXTRACT(YEAR FROM se.requester_shift_date)
      ORDER BY u.last_name, u.first_name, year DESC
    `

    // Transform flat data into the required structure
    const firefighterMap = new Map<number, FirefighterExchangeCount>()

    for (const row of data.rows) {
      if (!firefighterMap.has(row.id)) {
        firefighterMap.set(row.id, {
          id: row.id,
          first_name: row.first_name,
          last_name: row.last_name,
          years: {},
        })
      }

      const firefighter = firefighterMap.get(row.id)!
      if (row.year !== null) {
        firefighter.years[row.year] = Number(row.count)
      }
    }

    const firefighters = Array.from(firefighterMap.values())

    // Get all years that have approved exchanges
    const allYears = await sql`
      SELECT DISTINCT EXTRACT(YEAR FROM requester_shift_date)::int as year
      FROM shift_exchanges
      WHERE status = 'approved'
      ORDER BY year DESC
    `

    const years = allYears.rows.map((row: any) => row.year as number)

    return {
      firefighters,
      years,
    }
  } catch (error: any) {
    console.error('[v0] Error getting exchange count report:', error)
    return { error: 'Failed to fetch data' }
  }
}
