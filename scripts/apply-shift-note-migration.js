import { neon } from "@neondatabase/serverless";

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log("Adding SHIFT_NOTE_CREATED to audit_action_type enum...");
    try {
      await sql.query("ALTER TYPE audit_action_type ADD VALUE 'SHIFT_NOTE_CREATED'");
      console.log("✓ SHIFT_NOTE_CREATED added");
    } catch (e) {
      if (e.message && e.message.includes("already exists")) {
        console.log("✓ SHIFT_NOTE_CREATED already exists");
      } else {
        throw e;
      }
    }

    console.log("Adding SHIFT_NOTE_UPDATED to audit_action_type enum...");
    try {
      await sql.query("ALTER TYPE audit_action_type ADD VALUE 'SHIFT_NOTE_UPDATED'");
      console.log("✓ SHIFT_NOTE_UPDATED added");
    } catch (e) {
      if (e.message && e.message.includes("already exists")) {
        console.log("✓ SHIFT_NOTE_UPDATED already exists");
      } else {
        throw e;
      }
    }

    console.log("Adding SHIFT_NOTE_DELETED to audit_action_type enum...");
    try {
      await sql.query("ALTER TYPE audit_action_type ADD VALUE 'SHIFT_NOTE_DELETED'");
      console.log("✓ SHIFT_NOTE_DELETED added");
    } catch (e) {
      if (e.message && e.message.includes("already exists")) {
        console.log("✓ SHIFT_NOTE_DELETED already exists");
      } else {
        throw e;
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

applyMigration();
