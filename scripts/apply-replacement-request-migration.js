import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function applyMigration() {
  try {
    console.log("[v0] Starting migration...")
    
    // Add REPLACEMENT_REQUEST_APPROVED
    await sql.query("ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_REQUEST_APPROVED'")
    console.log("[v0] Added REPLACEMENT_REQUEST_APPROVED")
    
    // Add REPLACEMENT_REQUEST_REJECTED
    await sql.query("ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_REQUEST_REJECTED'")
    console.log("[v0] Added REPLACEMENT_REQUEST_REJECTED")
    
    console.log("[v0] Migration completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[v0] Migration error:", error.message)
    process.exit(1)
  }
}

applyMigration()
