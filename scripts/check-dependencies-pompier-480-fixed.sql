-- Vérifier les dépendances de l'utilisateur ID 480 "Pompier supplémentaire 1"

-- 1. Vérifier dans team_members
SELECT 'team_members' as table_name, COUNT(*) as count
FROM team_members
WHERE user_id = 480
UNION ALL

-- 2. Vérifier dans shift_assignments
SELECT 'shift_assignments' as table_name, COUNT(*) as count
FROM shift_assignments
WHERE user_id = 480
UNION ALL

-- 3. Vérifier dans replacements (comme user_id)
SELECT 'replacements (user_id)' as table_name, COUNT(*) as count
FROM replacements
WHERE user_id = 480
UNION ALL

-- 4. Vérifier dans replacements (comme replaced_user_id)
SELECT 'replacements (replaced_user_id)' as table_name, COUNT(*) as count
FROM replacements
WHERE replaced_user_id = 480
UNION ALL

-- 5. Vérifier dans shift_exchange_applications
SELECT 'shift_exchange_applications' as table_name, COUNT(*) as count
FROM shift_exchange_applications
WHERE user_id = 480
UNION ALL

-- 6. Vérifier dans leaves
SELECT 'leaves' as table_name, COUNT(*) as count
FROM leaves
WHERE user_id = 480
UNION ALL

-- 7. Vérifier dans notifications
SELECT 'notifications' as table_name, COUNT(*) as count
FROM notifications
WHERE user_id = 480
UNION ALL

-- 8. Vérifier dans shift_notes
SELECT 'shift_notes' as table_name, COUNT(*) as count
FROM shift_notes
WHERE user_id = 480
UNION ALL

-- 9. Vérifier dans audit_logs
SELECT 'audit_logs' as table_name, COUNT(*) as count
FROM audit_logs
WHERE user_id = 480;
