-- Diagnostic complet pour Raphael Cloutier le 5 avril 2026

-- 1. Vérifier tous les remplaçants assignés pour le 5 avril 2026
SELECT 
  sa.id,
  u.name as remplacant,
  u.id as user_id,
  sa.replaced_user_id,
  sa.shift_date,
  sa.start_time,
  sa.end_time,
  sa.is_partial
FROM shift_assignments sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE sa.shift_date = '2026-04-05'
ORDER BY sa.user_id, sa.start_time;

-- 2. Vérifier spécifiquement Raphael Cloutier (ID 1956)
SELECT 
  sa.id,
  sa.user_id,
  u.name,
  sa.replaced_user_id,
  ur.name as remplacé,
  sa.shift_date,
  sa.start_time,
  sa.end_time
FROM shift_assignments sa
LEFT JOIN users u ON sa.user_id = u.id
LEFT JOIN users ur ON sa.replaced_user_id = ur.id
WHERE sa.user_id = 1956
  AND sa.shift_date = '2026-04-05';

-- 3. Vérifier les IDs pour Yannick Dargy et Raphael Cloutier
SELECT id, name FROM users WHERE name LIKE '%Dargy%' OR name LIKE '%Cloutier%';
