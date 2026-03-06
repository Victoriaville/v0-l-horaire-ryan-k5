-- Remove Adan Boucher as replacement for Guy Lefebvre on February 9, 2026
-- Find the shift for February 9 (day shift 7h-17h)
-- Remove Adan Boucher's assignment from that shift

DELETE FROM shift_assignments
WHERE shift_date = '2026-02-09'
  AND user_id = (SELECT id FROM users WHERE first_name = 'Adan' AND last_name = 'Boucher')
  AND shift_id = (SELECT id FROM shifts WHERE shift_type = 'day' AND team_id = (SELECT team_id FROM team_members WHERE user_id = (SELECT id FROM users WHERE first_name = 'Guy' AND last_name = 'Lefebvre') LIMIT 1));

-- Verify the deletion
SELECT 'Deletion complete. Remaining assignments for 2026-02-09:' as status;
SELECT sa.id, u.first_name, u.last_name, sa.shift_date, s.shift_type 
FROM shift_assignments sa
JOIN users u ON sa.user_id = u.id
JOIN shifts s ON sa.shift_id = s.id
WHERE sa.shift_date = '2026-02-09' AND s.shift_type = 'day'
ORDER BY u.last_name;
