-- Vérifier la structure de la table users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Maintenant vérifier les dépendances du user ID 480
SELECT 'Users' as "Table", COUNT(*) as "Count" FROM users WHERE id = 480
UNION ALL
SELECT 'Team Members', COUNT(*) FROM team_members WHERE user_id = 480
UNION ALL
SELECT 'Shift Assignments', COUNT(*) FROM shift_assignments WHERE user_id = 480
UNION ALL
SELECT 'Replacements', COUNT(*) FROM replacements WHERE user_id = 480
UNION ALL
SELECT 'Applications', COUNT(*) FROM replacement_applications WHERE user_id = 480
UNION ALL
SELECT 'Leaves', COUNT(*) FROM leaves WHERE user_id = 480
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications WHERE user_id = 480
UNION ALL
SELECT 'Shift Exchanges', COUNT(*) FROM shift_exchanges WHERE user_id = 480
UNION ALL
SELECT 'Shift Notes', COUNT(*) FROM shift_notes WHERE user_id = 480
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs WHERE user_id = 480;
