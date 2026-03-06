-- Vérification des dépendances pour l'utilisateur ID 480 (Pompier supplémentaire 1)

-- 1. Vérifier si l'utilisateur existe
SELECT 'USER INFO' as check_type, id, name, email, is_admin, is_owner 
FROM users 
WHERE id = 480;

-- 2. Vérifier les adhésions aux équipes
SELECT 'TEAM_MEMBERS' as table_name, COUNT(*) as count 
FROM team_members 
WHERE user_id = 480;

-- 3. Vérifier les affectations de quarts
SELECT 'SHIFT_ASSIGNMENTS' as table_name, COUNT(*) as count 
FROM shift_assignments 
WHERE user_id = 480;

-- 4. Vérifier les absences (leaves)
SELECT 'LEAVES' as table_name, COUNT(*) as count 
FROM leaves 
WHERE user_id = 480;

-- 5. Vérifier les remplacements (replacements)
SELECT 'REPLACEMENTS_USER' as table_name, COUNT(*) as count 
FROM replacements 
WHERE user_id = 480;

-- 6. Vérifier les remplacements où l'utilisateur est demandeur
SELECT 'REPLACEMENTS_REPLACED' as table_name, COUNT(*) as count 
FROM replacements 
WHERE replaced_user_id = 480;

-- 7. Vérifier les échanges de quarts
SELECT 'SHIFT_EXCHANGES' as table_name, COUNT(*) as count 
FROM shift_exchanges 
WHERE requester_id = 480 OR acceptor_id = 480;

-- 8. Vérifier les notifications
SELECT 'NOTIFICATIONS' as table_name, COUNT(*) as count 
FROM notifications 
WHERE user_id = 480;

-- 9. Vérifier les notes de quart
SELECT 'SHIFT_NOTES' as table_name, COUNT(*) as count 
FROM shift_notes 
WHERE created_by = 480;

-- 10. Vérifier les logs d'audit
SELECT 'AUDIT_LOGS' as table_name, COUNT(*) as count 
FROM audit_logs 
WHERE user_id = 480;

-- Résumé final
SELECT 'TOTAL_DEPENDENCIES' as summary,
  (SELECT COUNT(*) FROM team_members WHERE user_id = 480) +
  (SELECT COUNT(*) FROM shift_assignments WHERE user_id = 480) +
  (SELECT COUNT(*) FROM leaves WHERE user_id = 480) +
  (SELECT COUNT(*) FROM replacements WHERE user_id = 480) +
  (SELECT COUNT(*) FROM replacements WHERE replaced_user_id = 480) +
  (SELECT COUNT(*) FROM shift_exchanges WHERE requester_id = 480 OR acceptor_id = 480) +
  (SELECT COUNT(*) FROM notifications WHERE user_id = 480) +
  (SELECT COUNT(*) FROM shift_notes WHERE created_by = 480) +
  (SELECT COUNT(*) FROM audit_logs WHERE user_id = 480) as total_count;
