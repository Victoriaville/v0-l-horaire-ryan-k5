-- Migration: Remove Telegram support from database
-- Date: 2026-03-16
-- This removes all Telegram-related columns and tables that are no longer used after Phase 2 code cleanup

-- Step 1: Remove Telegram columns from notification_preferences table
ALTER TABLE notification_preferences 
DROP COLUMN IF EXISTS enable_telegram;

-- Step 2: Remove Telegram chat ID column from notification_preferences table
ALTER TABLE notification_preferences 
DROP COLUMN IF EXISTS telegram_chat_id;

-- Step 3: Remove telegram_required flag from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS telegram_required;

-- Step 4: Drop the entire telegram_link_codes table (no longer needed)
DROP TABLE IF EXISTS telegram_link_codes CASCADE;

-- Verification: These tables/columns should remain intact
-- - users table: all other columns intact
-- - notification_preferences table: enable_app, enable_email, notify_* columns intact
-- - notifications table: unchanged
-- - replacements table: unchanged
-- - All notification logic continues to work with in-app and email only
