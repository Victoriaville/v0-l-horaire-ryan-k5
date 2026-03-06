-- Find and delete Adan Boucher (id 55) as replacement for Guy Lefebvre (id 32) on Feb 9, 2026

-- First, let's find the replacement request
SELECT 
  r.id as replacement_id,
  r.shift_date,
  r.shift_type,
  r.user_id,
  ra.applicant_id,
  u.first_name || ' ' || u.last_name as applicant_name
FROM replacements r
LEFT JOIN replacement_applications ra ON r.id = ra.replacement_id
LEFT JOIN users u ON ra.applicant_id = u.id
WHERE r.shift_date = '2026-02-09'
  AND r.user_id = 32
  AND ra.applicant_id = 55
  AND ra.status = 'assigned';

-- Now delete the assignment
DELETE FROM replacement_applications
WHERE replacement_id IN (
  SELECT r.id FROM replacements r
  WHERE r.shift_date = '2026-02-09'
    AND r.user_id = 32
)
AND applicant_id = 55
AND status = 'assigned';
