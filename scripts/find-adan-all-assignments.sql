-- Find all shift_assignments for Adan Boucher (user_id = 55)
SELECT sa.id, sa.shift_id, sa.user_id, sa.assigned_at,
       s.team_id, s.cycle_day, s.shift_type
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
WHERE sa.user_id = 55
ORDER BY s.team_id, s.cycle_day;
