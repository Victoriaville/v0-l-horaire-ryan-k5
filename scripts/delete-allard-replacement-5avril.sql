-- Suppression de l'assignation orpheline de Denis-Étienne Allard pour Yannick Dargy le 5 avril 2026
-- ID Assignation: 1979
-- Remplacant: Denis-Étienne Allard (ID 66)
-- Remplacé: Yannick Dargy (ID 23)
-- Date: 5 avril 2026
-- Temps: 07:00-07:00 (orpheline/invalide)

DELETE FROM shift_assignments
WHERE id = 1979;

-- Confirmer la suppression
SELECT 'Assignation orpheline de Denis-Étienne Allard supprimée avec succès' AS result;

-- Vérifier qu'il n'y a plus de remplaçants pour Yannick Dargy le 5 avril
SELECT COUNT(*) as remaining_replacements
FROM shift_assignments
WHERE replaced_user_id = 23
  AND shift_date = '2026-04-05';
