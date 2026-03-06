-- Diagnostic détaillé pour Adan Boucher et Guy Lefebvre le 9 février 2026

-- 1. D'abord, trouvons les IDs des utilisateurs
SELECT id, first_name, last_name, email, role 
FROM users 
WHERE first_name IN ('Adan', 'Guy') AND last_name IN ('Boucher', 'Lefebvre');

-- 2. Trouvons le shift du 9 février 2026 pour Guy Lefebvre
SELECT s.id, s.shift_type, s.start_time, s.end_time, s.team_id, s.cycle_day
FROM shifts s
WHERE s.cycle_day = (
  SELECT cycle_day FROM shifts 
  WHERE id IN (
    SELECT shift_id FROM shift_assignments 
    WHERE user_id = (SELECT id FROM users WHERE first_name = 'Guy' AND last_name = 'Lefebvre')
    LIMIT 1
  )
  LIMIT 1
);

-- 3. Cherchons les données relatives à Adan Boucher (user_id 55)
SELECT 
  'shift_assignments' as table_name,
  sa.id,
  sa.shift_id,
  sa.user_id,
  sa.replaced_user_id,
  sa.shift_date,
  sa.is_temporary_replacement,
  sa.replacement_order,
  sa.is_partial,
  sa.start_time,
  sa.end_time
FROM shift_assignments sa
WHERE sa.user_id = 55 AND DATE(sa.shift_date) = '2026-02-09'

UNION ALL

SELECT
  'replacements' as table_name,
  r.id,
  NULL::integer as shift_id,
  r.user_id,
  r.replaced_user_id,
  r.shift_date,
  NULL::boolean as is_temporary_replacement,
  r.replacement_order,
  r.is_partial,
  r.start_time,
  r.end_time
FROM replacements r
WHERE r.user_id = 55 AND DATE(r.shift_date) = '2026-02-09'

ORDER BY table_name;

-- 4. Vérifier les shift_assignments pour Guy Lefebvre le 9 février
SELECT 
  sa.id,
  sa.shift_id,
  sa.user_id,
  sa.replaced_user_id,
  sa.replacement_order,
  sa.is_partial,
  sa.is_temporary_replacement,
  sa.start_time,
  sa.end_time,
  s.shift_type,
  s.start_time as shift_start,
  s.end_time as shift_end
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
WHERE sa.replaced_user_id = (SELECT id FROM users WHERE first_name = 'Guy' AND last_name = 'Lefebvre')
AND DATE(sa.shift_date) = '2026-02-09'
ORDER BY sa.replacement_order;

-- 5. Vérifier les replacements pour Guy Lefebvre le 9 février
SELECT 
  r.id,
  r.user_id,
  CONCAT(u.first_name, ' ', u.last_name) as replacement_name,
  r.replaced_user_id,
  r.replacement_order,
  r.is_partial,
  r.start_time,
  r.end_time,
  r.status,
  r.shift_type,
  r.team_id
FROM replacements r
LEFT JOIN users u ON r.user_id = u.id
WHERE r.replaced_user_id = (SELECT id FROM users WHERE first_name = 'Guy' AND last_name = 'Lefebvre')
AND DATE(r.shift_date) = '2026-02-09'
ORDER BY r.replacement_order;

-- 6. Vérifier les replacement_applications pour Adan Boucher le 9 février
SELECT 
  ra.id,
  ra.replacement_id,
  ra.applicant_id,
  CONCAT(u.first_name, ' ', u.last_name) as applicant_name,
  ra.status,
  ra.is_partial_interest,
  ra.applied_at,
  ra.reviewed_at,
  ra.reviewed_by
FROM replacement_applications ra
LEFT JOIN users u ON ra.applicant_id = u.id
WHERE ra.applicant_id = 55 AND DATE(ra.applied_at) >= '2026-02-08'
ORDER BY ra.applied_at DESC;

-- 7. Vérifier les replacement_applications pour le remplacement de Guy Lefebvre
SELECT 
  ra.id,
  ra.replacement_id,
  ra.applicant_id,
  CONCAT(u.first_name, ' ', u.last_name) as applicant_name,
  ra.status,
  ra.applied_at,
  r.user_id as currently_assigned_user,
  CONCAT(u2.first_name, ' ', u2.last_name) as currently_assigned_name
FROM replacement_applications ra
LEFT JOIN users u ON ra.applicant_id = u.id
LEFT JOIN replacements r ON ra.replacement_id = r.id
LEFT JOIN users u2 ON r.user_id = u2.id
WHERE ra.replacement_id IN (
  SELECT id FROM replacements 
  WHERE replaced_user_id = (SELECT id FROM users WHERE first_name = 'Guy' AND last_name = 'Lefebvre')
  AND DATE(shift_date) = '2026-02-09'
)
ORDER BY ra.applied_at DESC;

-- 8. Vérifier les liens orphelins ou cassés
SELECT 
  'Replacement sans shift_assignment' as issue,
  r.id as replacement_id,
  r.user_id,
  CONCAT(u.first_name, ' ', u.last_name) as user_name,
  r.replaced_user_id,
  r.replacement_order,
  r.status
FROM replacements r
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN shift_assignments sa ON r.user_id = sa.user_id 
  AND sa.replaced_user_id = r.replaced_user_id
  AND DATE(sa.shift_date) = DATE(r.shift_date)
WHERE r.replaced_user_id = (SELECT id FROM users WHERE first_name = 'Guy' AND last_name = 'Lefebvre')
AND DATE(r.shift_date) = '2026-02-09'
AND sa.id IS NULL;

-- 9. État complet des données pour Adan Boucher le 9 février (toutes les tables)
SELECT 
  'shift_assignments' as source,
  COUNT(*) as count
FROM shift_assignments
WHERE user_id = 55 AND DATE(shift_date) = '2026-02-09'

UNION ALL

SELECT 
  'replacements' as source,
  COUNT(*) as count
FROM replacements
WHERE user_id = 55 AND DATE(shift_date) = '2026-02-09'

UNION ALL

SELECT 
  'replacement_applications' as source,
  COUNT(*) as count
FROM replacement_applications
WHERE applicant_id = 55 AND DATE(applied_at) >= '2026-02-08';
