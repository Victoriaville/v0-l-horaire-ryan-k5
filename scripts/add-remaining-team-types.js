#!/usr/bin/env node

import { neon } from "@neondatabase/serverless"

const MISSING_TYPES = ['TEAM_CREATED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'TEAM_MEMBERS_REORDERED']

async function main() {
  console.log('[v0] Adding remaining 4 team-related audit types...\n')

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) {
    console.error('[v0] ❌ ERROR: DATABASE_URL or POSTGRES_URL not set')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    console.log('[v0] Adding missing team types...')
    for (const type of MISSING_TYPES) {
      try {
        const alterQuery = `ALTER TYPE audit_action_type ADD VALUE '${type}'`
        await sql.query(alterQuery)
        console.log(`[v0]   ✅ Added: ${type}`)
      } catch (error) {
        if (error.message && error.message.includes('already exists')) {
          console.log(`[v0]   ℹ️  Already exists: ${type}`)
        } else {
          throw error
        }
      }
    }

    console.log('\n[v0] ✅ Migration complete!')
    process.exit(0)
  } catch (error) {
    console.error('[v0] ❌ ERROR:', error.message)
    process.exit(1)
  }
}

main()
