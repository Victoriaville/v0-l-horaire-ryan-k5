-- Analyser la distribution des erreurs non traitées
SELECT 
  type,
  COUNT(*) as error_count,
  MIN(created_at) as oldest_error,
  MAX(created_at) as newest_error
FROM notifications
WHERE error_acknowledged = false
GROUP BY type
ORDER BY error_count DESC;

-- Afficher les canaux en erreur les plus courants
SELECT 
  channels_failed,
  COUNT(*) as count
FROM (
  SELECT unnest(channels_failed) as channels_failed
  FROM notifications
  WHERE error_acknowledged = false AND channels_failed IS NOT NULL
) subquery
GROUP BY channels_failed
ORDER BY count DESC;
