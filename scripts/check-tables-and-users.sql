-- Simple diagnostic: Find Adan Boucher and Guy Lefebvre
SELECT 
  'Users in system:' as type,
  id, 
  first_name, 
  last_name
FROM users 
WHERE first_name ILIKE 'adan' OR first_name ILIKE 'guy'
ORDER BY first_name, last_name;

-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
