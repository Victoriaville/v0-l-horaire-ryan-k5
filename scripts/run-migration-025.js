import { sql } from "/vercel/share/v0-project/lib/db.js"

async function runMigration() {
  try {
    console.log("[v0] Executing migration: Adding ADMIN_STATUS_CHANGED and OWNER_STATUS_CHANGED to audit_action_type enum...")
    
    // Add ADMIN_STATUS_CHANGED
    await sql`ALTER TYPE audit_action_type ADD VALUE 'ADMIN_STATUS_CHANGED'`
    console.log("[v0] Added ADMIN_STATUS_CHANGED to enum")
    
    // Add OWNER_STATUS_CHANGED
    await sql`ALTER TYPE audit_action_type ADD VALUE 'OWNER_STATUS_CHANGED'`
    console.log("[v0] Added OWNER_STATUS_CHANGED to enum")
    
    console.log("[v0] Migration completed successfully!")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    process.exit(1)
  }
}

runMigration()
