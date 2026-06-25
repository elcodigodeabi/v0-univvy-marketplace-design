-- Script de validación: Verificar que no hay inconsistencias de roles
-- Ejecutar periódicamente para asegurar integridad de datos

-- 1. Diagnostico: Usuarios con tipo='asesor' pero role != 'asesor'
SELECT 
  'INCONSISTENCIA DETECTADA' as tipo,
  p.id,
  p.email,
  p.full_name,
  p.role as role_actual,
  u.raw_user_meta_data->>'tipo' as tipo_esperado,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE (u.raw_user_meta_data->>'tipo' = 'asesor')
  AND p.role != 'asesor'
ORDER BY p.created_at DESC;

-- 2. Resumen de estado
SELECT 
  COUNT(*) as total_usuarios,
  SUM(CASE WHEN role = 'asesor' THEN 1 ELSE 0 END) as total_asesores,
  SUM(CASE WHEN role = 'alumno' THEN 1 ELSE 0 END) as total_alumnos
FROM public.profiles;

-- 3. Usuarios registrados en los últimos 7 días
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  u.raw_user_meta_data->>'tipo' as tipo_metadata,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY p.created_at DESC;

-- Si encuentras inconsistencias, ejecuta esto para reparar:
/*
UPDATE public.profiles p
SET role = 'asesor'
FROM auth.users u
WHERE p.id = u.id 
  AND u.raw_user_meta_data->>'tipo' = 'asesor'
  AND p.role != 'asesor';
*/
