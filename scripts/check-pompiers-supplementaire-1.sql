-- Find the "pompiers supplémentaire 1" user
SELECT id, first_name, last_name, email, role, is_admin, is_owner, created_at
FROM users
WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
ORDER BY id;

-- Check for any team memberships
SELECT tm.id, tm.user_id, tm.team_id, t.name as team_name, tm.team_rank
FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
WHERE tm.user_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
ORDER BY tm.user_id;

-- Check for shift assignments
SELECT COUNT(*) as shift_assignment_count, user_id
FROM shift_assignments
WHERE user_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
GROUP BY user_id;

-- Check for replacements created by this user
SELECT COUNT(*) as replacement_count, created_by
FROM replacements
WHERE created_by IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
GROUP BY created_by;

-- Check for replacements related to this user
SELECT COUNT(*) as replacement_user_count, user_id
FROM replacements
WHERE user_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
GROUP BY user_id;

-- Check for applications
SELECT COUNT(*) as application_count, applicant_id
FROM replacement_applications
WHERE applicant_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
GROUP BY applicant_id;

-- Check for leaves
SELECT COUNT(*) as leave_count, user_id
FROM leaves
WHERE user_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
GROUP BY user_id;

-- Check for notification preferences
SELECT np.id, np.user_id, np.enable_email, np.enable_app, np.enable_telegram
FROM notification_preferences np
WHERE np.user_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
);

-- Check for exchanges
SELECT COUNT(*) as exchange_count, requester_id
FROM shift_exchanges
WHERE requester_id IN (
  SELECT id FROM users WHERE first_name LIKE '%pompiers%' OR last_name LIKE '%supplémentaire%'
)
GROUP BY requester_id;
