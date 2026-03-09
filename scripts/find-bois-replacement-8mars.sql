-- Chercher le remplacant de David Bois le 8 mars 2026

-- Afficher toutes les assignations pour David Bois le 8 mars 2026
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
WHERE u_replaced.first_name = 'David' 
  AND u_replaced.last_name = 'Bois'
  AND sh.id IN (
    SELECT shift_id FROM shifts
    WHERE CURRENT_DATE - INTERVAL '28' day + (cycle_day - 1) * INTERVAL '1 day' = '2026-03-08'
  )
ORDER BY sa.assigned_at DESC;
