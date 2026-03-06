-- Vérifier les dépendances de l'utilisateur "Pompier supplémentaire 1" (ID: 480)

SELECT 'Équipes' AS table_name, COUNT(*) AS count FROM team_members WHERE user_id = 480
UNION ALL
SELECT 'Assignations de quarts', COUNT(*) FROM shift_assignments WHERE user_id = 480
UNION ALL
SELECT 'Remplacements (demandeur)', COUNT(*) FROM replacements WHERE requester_id = 480
UNION ALL
SELECT 'Remplacements (utilisateur assigné)', COUNT(*) FROM replacements WHERE user_id = 480
UNION ALL
SELECT 'Remplacements (utilisateur remplacé)', COUNT(*) FROM replacements WHERE replaced_user_id = 480
UNION ALL
SELECT 'Applications de remplacement', COUNT(*) FROM replacement_applications WHERE user_id = 480
UNION ALL
SELECT 'Absences', COUNT(*) FROM leaves WHERE user_id = 480
UNION ALL
SELECT 'Notifications envoyées', COUNT(*) FROM notification_deliveries WHERE user_id = 480
UNION ALL
SELECT 'Échanges de quarts', COUNT(*) FROM shift_exchanges WHERE requester_id = 480 OR assignee_id = 480
UNION ALL
SELECT 'Notes de quart', COUNT(*) FROM shift_notes WHERE user_id = 480
UNION ALL
SELECT 'Logs audit (utilisateur)', COUNT(*) FROM audit_logs WHERE user_id = 480;
