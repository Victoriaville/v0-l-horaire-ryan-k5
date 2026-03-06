-- Find and delete Adan Boucher's assignment for Guy Lefebvre's shift on Feb 9, 2026

-- First, let's see what we're deleting:
SELECT 
  sa.id,
  u.name as assigned_user,
  s.shift_date,
  s.shift_type,
  sa.start_time,
  sa.end_time
FROM shift_assignments sa
JOIN users u ON sa.user_id = u.id
JOIN shifts s ON sa.shift_id = s.id
WHERE 
  s.shift_date = '2026-02-09'
  AND u.name = 'Adan Boucher'
  AND s.id IN (
    SELECT s2.id 
    FROM shifts s2 
    WHERE s2.shift_date = '2026-02-09'
    AND s2.user_id = (SELECT id FROM users WHERE name = 'Guy Lefebvre' LIMIT 1)
  );

-- Delete the assignments:
DELETE FROM shift_assignments
WHERE user_id = (SELECT id FROM users WHERE name = 'Adan Boucher' LIMIT 1)
  AND shift_id IN (
    SELECT id FROM shifts 
    WHERE shift_date = '2026-02-09'
    AND user_id = (SELECT id FROM users WHERE name = 'Guy Lefebvre' LIMIT 1)
  );
