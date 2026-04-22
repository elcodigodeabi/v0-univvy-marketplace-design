-- Test Supabase connection
-- This simple query tests if the connection is working

SELECT 
  current_database() as database_name,
  current_user as connected_user,
  now() as server_time;
