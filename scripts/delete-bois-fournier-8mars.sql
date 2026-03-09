-- Supprimer l'assignation de remplacant de Yan Fournier pour David Bois le 8 mars 2026
DELETE FROM shift_assignments
WHERE id = 1900
  AND replaced_user_id = (SELECT id FROM users WHERE first_name = 'David' AND last_name = 'Bois')
  AND user_id = (SELECT id FROM users WHERE first_name = 'Yan' AND last_name = 'Fournier');

-- Confirmer la suppression
SELECT 'Assignation supprimée avec succès' AS result;
