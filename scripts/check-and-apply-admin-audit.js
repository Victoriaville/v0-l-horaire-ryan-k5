#!/usr/bin/env node

/**
 * Script sécurisé pour vérifier et appliquer la migration des types audit admin
 * Usage: node scripts/check-and-apply-admin-audit.js
 */

import { sql } from '../lib/db.js';

async function checkEnumValues() {
  console.log('[v0] Vérification des types ENUM audit_action_type...');
  
  try {
    // Vérifier les valeurs existantes de l'ENUM
    const result = await sql`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'audit_action_type'
      ORDER BY e.enumsortorder
    `;
    
    const existingValues = result.map(r => r.enumlabel);
    console.log('[v0] Valeurs ENUM actuelles:', existingValues);
    
    const needsAdmin = !existingValues.includes('ADMIN_STATUS_CHANGED');
    const needsOwner = !existingValues.includes('OWNER_STATUS_CHANGED');
    
    if (!needsAdmin && !needsOwner) {
      console.log('[v0] ✅ SUCCESS: Les deux valeurs ENUM existent déjà');
      return true;
    }
    
    if (needsAdmin || needsOwner) {
      console.log('[v0] ⚠️  Migration nécessaire:');
      if (needsAdmin) console.log('[v0]   - ADMIN_STATUS_CHANGED manquant');
      if (needsOwner) console.log('[v0]   - OWNER_STATUS_CHANGED manquant');
      return false;
    }
  } catch (error) {
    console.error('[v0] ERROR lors de la vérification:', error.message);
    return null;
  }
}

async function applyMigration() {
  console.log('[v0] Application de la migration...');
  
  try {
    // Appliquer les deux ALTER TYPE en transaction
    await sql`ALTER TYPE audit_action_type ADD VALUE 'ADMIN_STATUS_CHANGED'`;
    console.log('[v0] ✅ ADMIN_STATUS_CHANGED ajouté');
    
    await sql`ALTER TYPE audit_action_type ADD VALUE 'OWNER_STATUS_CHANGED'`;
    console.log('[v0] ✅ OWNER_STATUS_CHANGED ajouté');
    
    return true;
  } catch (error) {
    console.error('[v0] ERROR lors de la migration:', error.message);
    return false;
  }
}

async function main() {
  console.log('[v0] ========================================');
  console.log('[v0] Vérification et Application de Migration');
  console.log('[v0] ========================================\n');
  
  const exists = await checkEnumValues();
  
  if (exists === true) {
    console.log('[v0] ✅ Aucune action requise - ENUM déjà à jour\n');
    process.exit(0);
  } else if (exists === false) {
    console.log('[v0] Tentative d\'application de la migration...\n');
    const success = await applyMigration();
    
    if (success) {
      console.log('[v0] ✅ Migration appliquée avec succès\n');
      
      // Vérifier à nouveau
      console.log('[v0] Vérification finale...');
      const finalCheck = await checkEnumValues();
      if (finalCheck) {
        console.log('[v0] ✅ Vérification finale réussie\n');
        process.exit(0);
      }
    } else {
      console.log('[v0] ❌ Erreur lors de l\'application de la migration\n');
      process.exit(1);
    }
  } else {
    console.log('[v0] ❌ Impossible de déterminer l\'état de la migration\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[v0] Erreur fatale:', err);
  process.exit(1);
});
