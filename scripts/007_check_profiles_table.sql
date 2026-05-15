-- Verificar si la tabla profiles existe y su estructura
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar los valores únicos del campo role (si existe)
SELECT DISTINCT role FROM public.profiles;
