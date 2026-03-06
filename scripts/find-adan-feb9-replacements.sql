-- Check for Adan Boucher replacements on Feb 9, 2026
SELECT 
  r.id,
  r.shift_id,
  r.original_user_id,
  r.replacement_user_id,
  s.shift_date,
  s.shift_type,
  u1.first_name || ' ' || u1.last_name as original_user,
  u2.first_name || ' ' || u2.last_name as replacement_user
FROM replacements r
JOIN shifts s ON r.shift_id = s.id
JOIN users u1 ON r.original_user_id = u1.id
JOIN users u2 ON r.replacement_user_id = u2.id
WHERE s.shift_date = '2026-02-09'
  AND r.replacement_user_id = 55  -- Adan Boucher
  AND r.original_user_id = 32     -- Guy Lefebvre
ORDER BY s.shift_type;

-- Also check shift_assignments for this date
SELECT 
  sa.id,
  sa.shift_id,
  sa.user_id,
  s.shift_date,
  s.shift_type,
  u.first_name || ' ' || u.last_name as user_name
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
JOIN users u ON sa.user_id = u.id
WHERE s.shift_date = '2026-02-09'
  AND sa.user_id = 55
ORDER BY s.shift_type;
