-- Delete Adan Boucher (id 55) as approved replacement for Guy Lefebvre on February 9, 2026
-- This removes the replacement_applications record

DELETE FROM replacement_applications
WHERE applicant_id = 55  -- Adan Boucher
AND replacement_id IN (
  SELECT r.id 
  FROM replacements r
  WHERE r.shift_date = '2026-02-09'
  AND r.status = 'assigned'
);

-- Verify the deletion
SELECT 'Deletion complete. Remaining replacements for Feb 9:' as status;
SELECT r.id, r.shift_date, r.shift_type, ra.applicant_id, u.first_name, u.last_name
FROM replacements r
LEFT JOIN replacement_applications ra ON r.id = ra.replacement_id
LEFT JOIN users u ON ra.applicant_id = u.id
WHERE r.shift_date = '2026-02-09'
ORDER BY r.shift_type, u.last_name;
