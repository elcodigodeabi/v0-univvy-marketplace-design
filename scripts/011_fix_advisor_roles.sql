-- ─── DIAGNOSTICO: Ver cuántos usuarios con tipo='asesor' tienen role != 'asesor' ───
SELECT COUNT(*) as total_asesores_incorrectos
FROM public.profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE (u.raw_user_meta_data->>'tipo' = 'asesor' OR u.raw_user_meta_data->>'role' = 'asesor')
  AND p.role != 'asesor';

-- ─── REPARACION: Actualizar todos los perfiles de asesores con role incorrecto ───
UPDATE public.profiles p
SET role = 'asesor', updated_at = now()
FROM auth.users u
WHERE p.id = u.id 
  AND (u.raw_user_meta_data->>'tipo' = 'asesor' OR u.raw_user_meta_data->>'role' = 'asesor')
  AND p.role != 'asesor';

-- ─── VERIFICACION: Contar asesores totales correctamente configurados ───
SELECT COUNT(*) as total_asesores_correctos
FROM public.profiles
WHERE role = 'asesor';

-- ─── LISTADO: Ver los primeros 10 asesores ───
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'asesor'
ORDER BY created_at DESC
LIMIT 10;
