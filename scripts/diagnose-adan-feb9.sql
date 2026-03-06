-- Diagnostic: Find exact shifts for Guy Lefebvre on Feb 9
SELECT 
  s.id as shift_id,
  s.shift_date,
  s.shift_type,
  u.first_name || ' ' || u.last_name as firefighter_name,
  sa.user_id,
  u2.first_name || ' ' || u2.last_name as assignment_user
FROM shifts s
LEFT JOIN firefighters f ON s.team_id = f.team_id
LEFT JOIN users u ON f.user_id = u.id
LEFT JOIN shift_assignments sa ON s.id = sa.shift_id
LEFT JOIN users u2 ON sa.user_id = u2.id
WHERE s.shift_date = '2026-02-09'
  AND u.first_name || ' ' || u.last_name = 'Guy Lefebvre'
ORDER BY s.shift_type, u2.first_name;
