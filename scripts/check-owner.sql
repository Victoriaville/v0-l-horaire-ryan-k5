-- Check who is the Owner in the system
SELECT id, full_name, email, is_owner, is_admin 
FROM users 
WHERE is_owner = true
LIMIT 10;
