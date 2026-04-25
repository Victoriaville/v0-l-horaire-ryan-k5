import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function verifyEnum() {
  try {
    console.log("[v0] Checking if REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN exists in enum...");
    
    const result = await sql`
      SELECT e.enumlabel 
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'audit_action_type'
      AND e.enumlabel = 'REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN'
    `;
    
    if (result.length > 0) {
      console.log("[v0] SUCCESS: REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN exists in enum");
      
      // Get all enum values for reference
      const allValues = await sql`
        SELECT e.enumlabel 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'audit_action_type'
        ORDER BY e.enumsortorder
      `;
      
      console.log("[v0] Total enum values:", allValues.length);
      console.log("[v0] All values:", allValues.map(v => v.enumlabel).join(", "));
    } else {
      console.log("[v0] ERROR: REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN NOT FOUND in enum");
      console.log("[v0] Need to add this value to the enum");
      
      // Add it now
      try {
        await sql`
          ALTER TYPE audit_action_type ADD VALUE 'REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN'
        `;
        console.log("[v0] Successfully added REPLACEMENT_CANDIDATE_ADDED_BY_ADMIN to enum");
      } catch (addError) {
        console.log("[v0] Error adding to enum:", addError.message);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error("[v0] Error:", error.message);
    process.exit(1);
  }
}

verifyEnum();
