-- Find and delete Adan Boucher's shift assignment for February 9, 2026 (Guy Lefebvre's shift)
-- Adan Boucher = user_id 55, Guy Lefebvre = user_id 32

-- First, find the shift for Guy Lefebvre on Feb 9, 2026 (day shift)
WITH target_shift AS (
  SELECT id FROM shifts
  WHERE 
    shift_date = '2026-02-09'
    AND shift_type = 'day'
    AND team_id = (SELECT team_id FROM shifts WHERE shift_date = '2026-02-09' AND shift_type = 'day' LIMIT 1)
  LIMIT 1
)
-- Delete Adan Boucher's assignment from that shift
DELETE FROM shift_assignments
WHERE 
  user_id = 55  -- Adan Boucher
  AND shift_id IN (SELECT id FROM target_shift);

-- Verify the deletion
SELECT COUNT(*) as remaining_assignments
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
WHERE 
  sa.user_id = 55  -- Adan Boucher
  AND s.shift_date = '2026-02-09'
  AND s.shift_type = 'day';
