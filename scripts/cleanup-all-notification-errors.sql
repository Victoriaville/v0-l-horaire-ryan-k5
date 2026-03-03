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
