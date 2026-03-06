-- Check all dependencies for user ID 480 "Pompier supplémentaire 1"
-- Based on actual database schema

SELECT 'Users' as table_name, COUNT(*) as count FROM users WHERE id = 480
UNION ALL
SELECT 'Team Members' as table_name, COUNT(*) as count FROM team_members WHERE user_id = 480
UNION ALL
SELECT 'Shift Assignments' as table_name, COUNT(*) as count FROM shift_assignments WHERE user_id = 480
UNION ALL
SELECT 'Replacements (as user)' as table_name, COUNT(*) as count FROM replacements WHERE user_id = 480
UNION ALL
SELECT 'Replacements (as replaced_user)' as table_name, COUNT(*) as count FROM replacements WHERE replaced_user_id = 480
UNION ALL
SELECT 'Replacement Applications' as table_name, COUNT(*) as count FROM replacement_applications WHERE applicant_id = 480
UNION ALL
SELECT 'Leaves (as user)' as table_name, COUNT(*) as count FROM leaves WHERE user_id = 480
UNION ALL
SELECT 'Notifications (as user)' as table_name, COUNT(*) as count FROM notifications WHERE user_id = 480
UNION ALL
SELECT 'Shift Exchanges (as requester)' as table_name, COUNT(*) as count FROM shift_exchanges WHERE requester_id = 480
UNION ALL
SELECT 'Notification Preferences' as table_name, COUNT(*) as count FROM notification_preferences WHERE user_id = 480
UNION ALL
SELECT 'Audit Logs (by user)' as table_name, COUNT(*) as count FROM audit_logs WHERE user_id = 480
UNION ALL
SELECT 'Shift Notes (created by)' as table_name, COUNT(*) as count FROM shift_notes WHERE created_by = 480;

-- Show details of the user
SELECT id, first_name, last_name, email, role, is_admin, is_owner, created_at FROM users WHERE id = 480;
