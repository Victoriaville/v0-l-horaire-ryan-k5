-- Diagnostic: Tous les remplaçants pour Yannick Dargy le 5 avril 2026

-- 1. Trouver l'ID de Denis-Étienne Allard
SELECT 
  id, 
  CONCAT(first_name, ' ', last_name) as full_name 
FROM users 
WHERE first_name LIKE '%Denis%'
   OR first_name LIKE '%Étienne%'
   OR last_name LIKE '%Allard%'
   OR first_name LIKE '%Etienne%';

-- 2. Vérifier toutes les assignations pour le 5 avril 2026
SELECT 
  sa.id,
  sa.user_id,
  CONCAT(u.first_name, ' ', u.last_name) as remplacant,
  sa.replaced_user_id,
  CONCAT(ur.first_name, ' ', ur.last_name) as remplacé,
  sa.shift_date,
  sa.start_time,
  sa.end_time,
  sa.is_partial
FROM shift_assignments sa
LEFT JOIN users u ON sa.user_id = u.id
LEFT JOIN users ur ON sa.replaced_user_id = ur.id
WHERE sa.shift_date = '2026-04-05'
ORDER BY sa.id;

-- 3. Spécifiquement les remplaçants pour Yannick Dargy (ID 23)
SELECT 
  sa.id,
  sa.user_id,
  CONCAT(u.first_name, ' ', u.last_name) as remplacant,
  sa.replaced_user_id,
  sa.shift_date,
  sa.start_time,
  sa.end_time
FROM shift_assignments sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE sa.replaced_user_id = 23
  AND sa.shift_date = '2026-04-05';
