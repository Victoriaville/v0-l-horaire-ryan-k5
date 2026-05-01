#!/usr/bin/env node

/**
 * Script ULTRA-SÉCURISÉ pour appliquer la migration des types ENUM audit
 * Utilise @vercel/postgres (SQL client du projet)
 */

import { sql } from '@vercel/postgres';

async function checkEnumValues() {
  console.log('[v0] Vérification des types ENUM audit_action_type...');
  
  try {
    const result = await sql`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'audit_action_type'
      ORDER BY e.enumsortorder
    `;
    
    const existingValues = result.rows.map(r => r.enumlabel);
    console.log('[v0] Valeurs ENUM actuelles:', existingValues.join(', '));
    
    const hasAdmin = existingValues.includes('ADMIN_STATUS_CHANGED');
    const hasOwner = existingValues.includes('OWNER_STATUS_CHANGED');
    
    return { hasAdmin, hasOwner, total: existingValues.length };
  } catch (error) {
    console.error('[v0] ERROR lors de la vérification:', error.message);
    throw error;
  }
}

async function applyMigration() {
  console.log('[v0] Application de la migration...');
  
  try {
    await sql`ALTER TYPE audit_action_type ADD VALUE 'ADMIN_STATUS_CHANGED'`;
    console.log('[v0] ✅ ADMIN_STATUS_CHANGED ajouté');
    
    await sql`ALTER TYPE audit_action_type ADD VALUE 'OWNER_STATUS_CHANGED'`;
    console.log('[v0] ✅ OWNER_STATUS_CHANGED ajouté');
    
    return true;
  } catch (error) {
    console.error('[v0] ERROR lors de la migration:', error.message);
    throw error;
  }
}

async function main() {
  console.log('[v0] ========================================');
  console.log('[v0] Migration Audit Types - Mode Ultra-Sûr');
  console.log('[v0] ========================================\n');
  
  try {
    // ÉTAPE 1: Vérifier l'état actuel
    const initialState = await checkEnumValues();
    
    if (initialState.hasAdmin && initialState.hasOwner) {
      console.log('[v0] ✅ Les deux valeurs ENUM existent déjà');
      console.log('[v0] ✅ Aucune action requise\n');
      process.exit(0);
    }
    
    console.log('[v0] ⚠️  Migration nécessaire:');
    if (!initialState.hasAdmin) console.log('[v0]   ❌ ADMIN_STATUS_CHANGED manquant');
    if (!initialState.hasOwner) console.log('[v0]   ❌ OWNER_STATUS_CHANGED manquant');
    
    // ÉTAPE 2: Appliquer la migration
    console.log('[v0] \nApplication de la migration...\n');
    await applyMigration();
    
    // ÉTAPE 3: Vérifier que la migration a réussi
    console.log('[v0] \nVérification finale...\n');
    const finalState = await checkEnumValues();
    
    if (finalState.hasAdmin && finalState.hasOwner) {
      console.log('[v0] ✅ Vérification finale réussie');
      console.log('[v0] ✅ Total de valeurs ENUM:', finalState.total);
      console.log('[v0] ✅ Migration appliquée avec succès!\n');
      process.exit(0);
    } else {
      console.log('[v0] ❌ La vérification finale a échoué');
      console.log('[v0]   Admin:', finalState.hasAdmin ? '✅' : '❌');
      console.log('[v0]   Owner:', finalState.hasOwner ? '✅' : '❌');
      process.exit(1);
    }
  } catch (error) {
    console.error('[v0] ❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

main();
