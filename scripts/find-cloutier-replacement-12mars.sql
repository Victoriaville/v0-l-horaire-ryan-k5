-- Chercher le remplacant de Tomy Poisson-Carignan le 12 mars 2026 (jour)

SELECT 
  sa.id,
  u_replaced.first_name || ' ' || u_replaced.last_name as "Pompier remplacé",
  u_replacement.first_name || ' ' || u_replacement.last_name as "Remplacant",
  sa.start_time,
  sa.end_time
FROM shift_assignments sa
LEFT JOIN users u_replaced ON sa.replaced_user_id = u_replaced.id
LEFT JOIN users u_replacement ON sa.user_id = u_replacement.id
WHERE u_replaced.first_name = 'Tomy'
  AND u_replaced.last_name = 'Poisson-Carignan'
  AND u_replacement.first_name = 'Raphael'
  AND u_replacement.last_name = 'Cloutier';
