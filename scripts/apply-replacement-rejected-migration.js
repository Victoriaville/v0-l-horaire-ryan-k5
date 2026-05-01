import { neon } from "@neondatabase/serverless"

const main = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL, {
      fetchConnectionCache: true,
      disableWarningInBrowsers: true,
    })

    console.log("Adding REPLACEMENT_REJECTED to audit_action_type enum...")

    // Try to add the value
    const result = await sql`ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_REJECTED' BEFORE 'SHIFT_CREATED'`

    console.log("✅ REPLACEMENT_REJECTED added successfully")
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      console.log("✅ REPLACEMENT_REJECTED already exists in enum")
    } else {
      console.error("Error adding REPLACEMENT_REJECTED:", error)
      process.exit(1)
    }
  }
}

main()
