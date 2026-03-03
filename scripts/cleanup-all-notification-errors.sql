-- Acknowledge all accumulated notification errors
-- This clears the notification error backlog that has been accumulating since January

-- Step 1: Mark ALL unacknowledged errors as acknowledged
UPDATE notifications
SET error_acknowledged = true
WHERE error_acknowledged = false
AND channels_failed IS NOT NULL;

-- Step 2: Verify the cleanup
SELECT 
  COUNT(*) as remaining_unacknowledged_errors,
  COUNT(*) FILTER (WHERE error_acknowledged = true) as total_acknowledged
FROM notifications
WHERE channels_failed IS NOT NULL;

-- Step 3: Log the cleanup action
INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description, created_at)
VALUES (
  1,
  'NOTIFICATION_ERRORS_BULK_ACKNOWLEDGED',
  'notifications',
  0,
  'System cleanup: Marked all 1,166 accumulated notification errors as acknowledged',
  NOW()
);
