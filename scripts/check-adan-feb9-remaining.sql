-- Check all remaining replacements for Adan Boucher (id 55) on Feb 9, 2026
SELECT 
  r.id as replacement_id,
  r.shift_date,
  r.shift_type,
  u.first_name || ' ' || u.last_name as replaced_firefighter,
  r.status,
  ra.id as application_id,
  ra.applicant_id,
  (SELECT first_name || ' ' || last_name FROM users WHERE id = ra.applicant_id) as applicant_name,
  ra.status as application_status,
  sa.id as shift_assignment_id,
  sa.user_id,
  sa.assigned_at
FROM replacements r
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN replacement_applications ra ON r.id = ra.replacement_id
LEFT JOIN shift_assignments sa ON ra.id = sa.replacement_application_id
WHERE DATE(r.shift_date) = '2026-02-09'
  AND (ra.applicant_id = 55 OR sa.user_id = 55)
ORDER BY r.shift_date, r.shift_type;
