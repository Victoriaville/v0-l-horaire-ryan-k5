-- Add password_force_reset column to users table
-- This column tracks whether a user must change their password on next login
-- DEFAULT TRUE means all existing users will be required to reset their password

ALTER TABLE users
ADD COLUMN password_force_reset BOOLEAN DEFAULT TRUE;

-- Verify the column was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'password_force_reset';
