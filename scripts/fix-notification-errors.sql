-- First, let's see what unacknowledged errors we have
SELECT 
  type,
  related_id,
  COUNT(*) as error_count,
  STRING_AGG(DISTINCT channels_failed::text, ', ') as failed_channels,
  error_acknowledged
FROM notifications
WHERE error_acknowledged = false
  AND (channels_failed IS NOT NULL AND array_length(channels_failed, 1) > 0)
GROUP BY type, related_id, error_acknowledged
ORDER BY related_id DESC;

-- Now mark ALL notifications with any errors as acknowledged if they were already marked
-- This ensures consistency: if one row of a group was marked, mark them ALL
UPDATE notifications
SET error_acknowledged = true
WHERE (channels_failed IS NOT NULL AND array_length(channels_failed, 1) > 0)
  AND error_acknowledged = false;

-- Verify the fix
SELECT 
  COUNT(*) as total_unacknowledged_errors
FROM notifications
WHERE error_acknowledged = false
  AND (channels_failed IS NOT NULL AND array_length(channels_failed, 1) > 0);
