import { sql as neonSql } from "@neondatabase/serverless"

const sql = neonSql(process.env.DATABASE_URL || "")

async function main() {
  try {
    console.log("[v0] Checking if REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN enum value exists...")

    // Check if value already exists
    const existing = await sql`
      SELECT enumlabel FROM pg_enum 
      WHERE enumlabel = 'REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN'
    `

    if (existing.length > 0) {
      console.log("[v0] REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN already exists in database")
      return
    }

    console.log("[v0] Adding REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN to audit_action_type enum...")

    await sql`
      ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN'
    `

    console.log("[v0] ✅ Successfully added REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN")

    // Verify
    const verify = await sql`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtype = 'audit_action_type'::regtype
      ORDER BY enumlabel
    `

    console.log("[v0] Total audit action types:", verify.length)
    console.log("[v0] ✅ Migration completed successfully")
  } catch (error) {
    console.error("[v0] Error:", error)
    process.exit(1)
  }
}

main()
