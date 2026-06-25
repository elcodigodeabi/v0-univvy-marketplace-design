-- Fix: Actualizar profiles.role basado en auth.users.raw_user_meta_data
-- Ejecutar este script en el SQL Editor de Supabase

UPDATE public.profiles p
SET role = CASE 
  WHEN u.raw_user_meta_data->>'tipo' = 'asesor' THEN 'asesor'
  WHEN u.raw_user_meta_data->>'role' = 'asesor' THEN 'asesor'
  ELSE COALESCE(p.role, 'alumno')
END
FROM auth.users u
WHERE p.id = u.id AND (u.raw_user_meta_data->>'tipo' = 'asesor' OR u.raw_user_meta_data->>'role' = 'asesor');

-- Verificar cuántos asesores se actualizaron
SELECT COUNT(*) as asesores_encontrados FROM public.profiles WHERE role = 'asesor';
