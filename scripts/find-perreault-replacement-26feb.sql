-- Chercher le remplacant de Marc Perreault le 26 février 2026

-- D'abord, trouver les IDs
WITH user_ids AS (
  SELECT id, name FROM users WHERE name ILIKE '%Perreault%' OR name ILIKE '%Frêchette%'
)
SELECT * FROM user_ids;

-- Afficher toutes les assignations pour Marc Perreault le 26 février 2026
SELECT 
  sa.id,
  sa.shift_date,
  sa.shift_type,
  u_replaced.name as "Pompier remplacé",
  u_replacement.name as "Remplacant",
  sa.status,
  sa.created_at
FROM shift_assignments sa
LEFT JOIN users u_replaced ON sa.replaced_user_id = u_replaced.id
LEFT JOIN users u_replacement ON sa.user_id = u_replacement.id
WHERE sa.shift_date = '2026-02-26'
  AND (u_replaced.name ILIKE '%Perreault%' OR u_replacement.name ILIKE '%Perreault%')
ORDER BY sa.created_at DESC;

-- Afficher TOUS les remplacements le 26 février (pour voir le contexte)
SELECT 
  sa.id,
  sa.shift_date,
  sa.shift_type,
  u_replaced.name as "Pompier remplacé",
  u_replacement.name as "Remplacant",
  sa.status
FROM shift_assignments sa
LEFT JOIN users u_replaced ON sa.replaced_user_id = u_replaced.id
LEFT JOIN users u_replacement ON sa.user_id = u_replacement.id
WHERE sa.shift_date = '2026-02-26'
  AND sa.replaced_user_id IS NOT NULL
ORDER BY sa.id;
