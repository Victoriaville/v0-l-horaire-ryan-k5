#!/usr/bin/env node

import { neon } from "@neondatabase/serverless"

const NEW_TYPES = [
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGED_OWN',
  'PASSWORD_RESET_ADMIN',
  'SHIFT_CREATED',
  'SHIFT_DELETED',
  'SHIFT_UPDATED',
  'TEAM_CREATED',
  'TEAM_MEMBER_ADDED',
  'TEAM_MEMBER_REMOVED',
  'FIREFIGHTER_ROLE_UPDATED',
  'FIREFIGHTER_DELETED',
  'TEAM_MEMBERS_REORDERED',
  'SHIFT_ASSIGNMENT_CREATED',
  'SHIFT_ASSIGNMENT_DELETED',
  'SHIFT_NOTE_CREATED',
  'SHIFT_NOTE_UPDATED',
  'NOTIFICATION_SENT_MANUAL',
]

async function main() {
  console.log('[v0] Starting migration for 18 new audit action types...\n')

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!databaseUrl) {
    console.error('[v0] ❌ ERROR: DATABASE_URL or POSTGRES_URL not set')
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  try {
    // Step 1: Check existing enum values
    console.log('[v0] Step 1: Checking existing ENUM values...')
    const existingResult = await sql`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'audit_action_type'
      ORDER BY e.enumlabel
    `

    const existingValues = existingResult.map((row) => row.enumlabel)
    console.log(`[v0] Found ${existingValues.length} existing values\n`)

    // Step 2: Identify missing values
    const missingValues = NEW_TYPES.filter((type) => !existingValues.includes(type))

    if (missingValues.length === 0) {
      console.log('[v0] ✅ All 18 values already exist in ENUM. Migration skipped.')
      process.exit(0)
    }

    console.log(`[v0] Found ${missingValues.length} missing values to add:`)
    missingValues.forEach((val) => console.log(`[v0]   - ${val}`))
    console.log()

    // Step 3: Add each missing value individually using raw SQL (not parameterized)
    console.log('[v0] Step 2: Adding missing enum values...')
    for (const type of missingValues) {
      try {
        // Use raw SQL string - ALTER TYPE doesn't support parameters
        const alterQuery = `ALTER TYPE audit_action_type ADD VALUE '${type}'`
        await sql.query(alterQuery)
        console.log(`[v0]   ✅ Added: ${type}`)
      } catch (error) {
        // Value might already exist, that's okay
        if (error.message && error.message.includes('already exists')) {
          console.log(`[v0]   ℹ️  Already exists: ${type}`)
        } else {
          throw error
        }
      }
    }

    console.log('\n[v0] ✅ All missing values have been added!')

    // Step 4: Verify
    console.log('[v0] Step 3: Verifying migration...\n')
    const verifyResult = await sql`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'audit_action_type'
      ORDER BY e.enumlabel
    `

    const finalValues = verifyResult.map((row) => row.enumlabel)
    console.log(`[v0] Total ENUM values after migration: ${finalValues.length}\n`)
    console.log('[v0] 📋 All audit action types are now available:')
    finalValues.forEach((val) => console.log(`[v0]   - ${val}`))

    // Check if all new values are present
    const allPresent = NEW_TYPES.every((type) => finalValues.includes(type))

    if (allPresent) {
      console.log('\n[v0] ✅ Migration complete! All 18 new audit types are ready.')
      process.exit(0)
    } else {
      const notAdded = NEW_TYPES.filter((type) => !finalValues.includes(type))
      console.error(`\n[v0] ❌ ERROR: Some values were not added: ${notAdded.join(', ')}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('[v0] ❌ ERROR during migration:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
