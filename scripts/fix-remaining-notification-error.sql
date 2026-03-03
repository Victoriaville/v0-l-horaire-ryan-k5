-- Mark the remaining unacknowledged notification error as acknowledged
UPDATE notifications
SET error_acknowledged = true
WHERE related_id = 1265
  AND type = 'replacement_available'
  AND error_acknowledged = false;

-- Verify all errors are now acknowledged
SELECT 
  COUNT(*) as total_unacknowledged_errors
FROM notifications
WHERE error_acknowledged = false
  AND channels_failed IS NOT NULL;

-- Show the fixed notification
SELECT 
  type,
  related_id,
  COUNT(*) as error_count,
  error_acknowledged,
  channels_failed
FROM notifications
WHERE related_id = 1265
GROUP BY type, related_id, error_acknowledged, channels_failed;
