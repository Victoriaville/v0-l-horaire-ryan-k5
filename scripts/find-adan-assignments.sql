-- Diagnostic: Find Adan Boucher and Guy Lefebvre's IDs and their assignments for Feb 9
SELECT 
  u1.id as adan_id, 
  u1.first_name || ' ' || u1.last_name as adan_name,
  u2.id as guy_id,
  u2.first_name || ' ' || u2.last_name as guy_name
FROM users u1, users u2
WHERE u1.first_name = 'Adan' AND u1.last_name = 'Boucher'
  AND u2.first_name = 'Guy' AND u2.last_name = 'Lefebvre';

-- Show shifts for Guy Lefebvre on Feb 9
SELECT s.id, s.shift_type, s.start_time, s.end_time, sh.id as shift_id
FROM shifts s
JOIN team_members tm ON s.team_id = tm.team_id
JOIN users u ON tm.user_id = u.id
WHERE u.first_name = 'Guy' AND u.last_name = 'Lefebvre'
LIMIT 1;

-- Show all assignments for Guy's shift(s) on Feb 9
SELECT sa.id, u.first_name, u.last_name, sa.assigned_at
FROM shift_assignments sa
JOIN users u ON sa.user_id = u.id
WHERE sa.shift_id IN (
  SELECT s.id FROM shifts s
  JOIN team_members tm ON s.team_id = tm.team_id
  JOIN users u2 ON tm.user_id = u2.id
  WHERE u2.first_name = 'Guy' AND u2.last_name = 'Lefebvre'
);
