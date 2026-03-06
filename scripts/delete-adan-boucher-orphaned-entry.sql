-- Delete orphaned shift_assignment for Adan Boucher on Feb 9, 2026 day shift only
-- This removes the stray entry that wasn't properly cleaned up

-- First: Identify the exact record to delete
SELECT 
  sa.id,
  sa.user_id,
  u.first_name,
  u.last_name,
  sa.replaced_user_id,
  ru.first_name as replaced_first_name,
  ru.last_name as replaced_last_name,
  s.shift_type,
  s.cycle_day,
  sa.replacement_order,
  sa.is_partial
FROM shift_assignments sa
JOIN users u ON sa.user_id = u.id
JOIN users ru ON sa.replaced_user_id = ru.id
JOIN shifts s ON sa.shift_id = s.id
WHERE u.id = 55 -- Adan Boucher
  AND ru.id = 32 -- Guy Lefebvre
  AND s.cycle_day = 9 -- February 9
  AND s.shift_type = 'day';

-- Now delete this specific orphaned record
DELETE FROM shift_assignments 
WHERE id IN (
  SELECT sa.id
  FROM shift_assignments sa
  JOIN users u ON sa.user_id = u.id
  JOIN users ru ON sa.replaced_user_id = ru.id
  JOIN shifts s ON sa.shift_id = s.id
  WHERE u.id = 55 -- Adan Boucher
    AND ru.id = 32 -- Guy Lefebvre
    AND s.cycle_day = 9 -- February 9
    AND s.shift_type = 'day'
);

-- Verify it's deleted
SELECT 'Remaining shift_assignments for this criteria:' as status;
SELECT * FROM shift_assignments sa
JOIN users u ON sa.user_id = u.id
WHERE u.id = 55 AND sa.replaced_user_id = 32;
