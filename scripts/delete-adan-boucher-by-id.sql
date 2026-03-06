-- Direct deletion by ID
-- The orphaned entry has shift_assignment ID = 1819
DELETE FROM shift_assignments WHERE id = 1819;

-- Verify deletion
SELECT 'Verification - remaining shift_assignments for Adan Boucher (id 55) replacing Guy Lefebvre (id 32):' as status;
SELECT COUNT(*) as count FROM shift_assignments 
WHERE user_id = 55 AND replaced_user_id = 32;
