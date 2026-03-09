-- Chercher le remplacant de Tomy Poisson-Carignan le 12 mars 2026 (jour)

SELECT 
  sa.id,
  sh.id as shift_id,
  u_replaced.first_name || ' ' || u_replaced.last_name as "Pompier remplacé",
  u_replacement.first_name || ' ' || u_replacement.last_name as "Remplacant",
  sh.shift_type,
  sh.start_time,
  sh.end_time,
  t.name as "Équipe",
  sa.is_direct_assignment,
  sa.assigned_at
FROM shift_assignments sa
LEFT JOIN users u_replaced ON sa.replaced_user_id = u_replaced.id
LEFT JOIN users u_replacement ON sa.user_id = u_replacement.id
LEFT JOIN shifts sh ON sa.shift_id = sh.id
LEFT JOIN teams t ON sh.team_id = t.id
WHERE u_replaced.first_name = 'Tomy'
  AND u_replaced.last_name = 'Poisson-Carignan'
  AND sh.shift_type = 'day'
  AND DATE(sh.start_time) = '2026-03-12'
ORDER BY sa.assigned_at DESC;
