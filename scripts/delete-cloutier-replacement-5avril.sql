-- Suppression de l'assignation orpheline de Raphael Cloutier pour Yannick Dargy le 5 avril 2026 (jour)
-- Remplacant: Raphael Cloutier (ID 1956)
-- Remplacé: Yannick Dargy
-- Date: 5 avril 2026 (dimanche)
-- Quart: jour (07:00-17:00)

DELETE FROM shift_assignments
WHERE 
  replaced_user_id IS NULL
  AND user_id = 1956  -- Raphael Cloutier
  AND shift_date = '2026-04-05'
  AND start_time = '07:00'
  AND end_time = '17:00'
  AND shift_type = 'jour';

-- Vérification: afficher l'entrée avant suppression (à titre informatif)
SELECT 
  id,
  user_id,
  replaced_user_id,
  shift_date,
  start_time,
  end_time,
  shift_type
FROM shift_assignments
WHERE 
  user_id = 1956
  AND shift_date = '2026-04-05'
  AND shift_type = 'jour';
