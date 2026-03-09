-- Suppression de l'assignation orpheline de Raphael Cloutier (ID 18) pour Yannick Dargy le 5 avril 2026
-- Assignation ID: 1980 avec temps invalides (07:00-07:00)

DELETE FROM shift_assignments
WHERE id = 1980;

-- Vérifier que c'est bien supprimé
SELECT 'Assignation ID 1980 supprimée' AS result;

-- Confirmer qu'aucune assignation n'existe pour Raphael Cloutier le 5 avril 2026
SELECT 
  COUNT(*) as remaining_assignments
FROM shift_assignments
WHERE user_id = 18
  AND shift_date = '2026-04-05';
