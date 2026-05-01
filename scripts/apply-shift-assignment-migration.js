import { neon } from "@neondatabase/serverless"

async function applyMigration() {
  console.log("[v0] Applying SHIFT_ASSIGNMENT migration...")

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Check if types already exist
    const existingTypes = await sql`
      SELECT e.enumlabel 
      FROM pg_enum e 
      WHERE e.enumtypid = (SELECT oid FROM pg_type WHERE typname = 'audit_action_type')
      AND e.enumlabel IN ('SHIFT_ASSIGNMENT_CREATED', 'SHIFT_ASSIGNMENT_DELETED')
    `

    if (existingTypes.length === 2) {
      console.log("[v0] Both SHIFT_ASSIGNMENT types already exist - skipping migration")
      process.exit(0)
    }

    // Add SHIFT_ASSIGNMENT_CREATED if missing
    if (!existingTypes.find(t => t.enumlabel === 'SHIFT_ASSIGNMENT_CREATED')) {
      console.log("[v0] Adding SHIFT_ASSIGNMENT_CREATED...")
      await sql`ALTER TYPE audit_action_type ADD VALUE 'SHIFT_ASSIGNMENT_CREATED'`
      console.log("[v0] Successfully added SHIFT_ASSIGNMENT_CREATED")
    }

    // Add SHIFT_ASSIGNMENT_DELETED if missing
    if (!existingTypes.find(t => t.enumlabel === 'SHIFT_ASSIGNMENT_DELETED')) {
      console.log("[v0] Adding SHIFT_ASSIGNMENT_DELETED...")
      await sql`ALTER TYPE audit_action_type ADD VALUE 'SHIFT_ASSIGNMENT_DELETED'`
      console.log("[v0] Successfully added SHIFT_ASSIGNMENT_DELETED")
    }

    console.log("[v0] Migration complete!")
    process.exit(0)
  } catch (error) {
    console.error("[v0] Migration error:", error.message)
    process.exit(1)
  }
}

applyMigration()
