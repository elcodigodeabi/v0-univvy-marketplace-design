# Gestión de Roles de Asesores - Guía de Implementación

## Resumen

Se implementó un sistema robusto para gestionar roles de usuarios (alumnos/asesores) evitando inconsistencias en la base de datos.

## Problema Original

Los asesores que se registraban por email no aparecían en las búsquedas porque:
- El `tipo = 'asesor'` se guardaba en `auth.users.raw_user_meta_data`
- Pero la tabla `profiles` tenía `role = 'alumno'` (por defecto)
- Las búsquedas filtraban solo por `.eq("role", "asesor")` en `profiles`

**Solución:** Se arreglaron 2 asesores (spotifyvictoria6, nombre22comun) que tenían datos inconsistentes.

---

## Flujo Correcto (Actual)

### 1. **Registro de Usuario**
```
Usuario selecciona "Asesor" en formulario
    ↓
Supabase signUp recibe data con tipo='asesor'
    ↓
Trigger handle_new_user() crea perfil con role='asesor'
    ↓
✅ El asesor aparece en búsquedas automáticamente
```

**Archivos:**
- `app/registro/page.tsx` - Formulario de registro
- `app/actions/auth.ts` - Lógica de signup
- `scripts/008_complete_database_schema.sql` - Trigger mejorado

### 2. **Verificación de Roles**
Para asegurar que todos los asesores tienen rol correcto:

```bash
# En Supabase SQL Editor:
SELECT COUNT(*) FROM public.profiles WHERE role = 'asesor';
```

### 3. **Panel de Admin**
Nuevo panel en `/admin/usuarios-roles` permite:
- Ver todos los usuarios
- Filtrar por rol
- Cambiar roles manualmente si es necesario
- Ver estadísticas de usuarios

**Archivos:**
- `app/admin/usuarios-roles/page.tsx` - Panel de gestión
- `app/api/admin/users/route.ts` - API para obtener usuarios
- `app/api/admin/users/update-role/route.ts` - API para actualizar roles

---

## Validación y Mantenimiento

### Script de Validación Periódica
Ejecuta regularmente para detectar inconsistencias:

```bash
# En Supabase SQL Editor, copia el contenido de:
scripts/012_validate_advisor_roles.sql
```

Este script:
- ✅ Detecta usuarios con `tipo='asesor'` pero `role!='asesor'`
- ✅ Muestra resumen de usuarios
- ✅ Lista usuarios registrados en últimos 7 días
- ✅ Incluye comando para reparar si encuentra inconsistencias

### Reparación Manual (si es necesario)

```sql
UPDATE public.profiles p
SET role = 'asesor'
FROM auth.users u
WHERE p.id = u.id 
  AND u.raw_user_meta_data->>'tipo' = 'asesor'
  AND p.role != 'asesor';
```

---

## Trigger: Función de Creación de Perfiles

**Ubicación:** `scripts/008_complete_database_schema.sql` (línea 440)

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 
             NEW.raw_user_meta_data ->> 'nombre', 
             split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'tipo' = 'asesor' THEN 'asesor'
      WHEN NEW.raw_user_meta_data ->> 'role' = 'asesor' THEN 'asesor'
      ELSE 'alumno'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Mejoras aplicadas:**
- Usa `CASE` para garantizar captura de `tipo = 'asesor'`
- Soporta ambos `tipo` y `role` en metadata
- Default a `alumno` si no encuentra datos

---

## Búsquedas de Asesores

### Ubicaciones donde aparecen asesores:
1. `/asesores` - Listado completo
2. `/buscar` - Búsqueda con filtros
3. `/asesores/[id]` - Perfil de asesor

**Query base:**
```typescript
const { data: asesores } = await supabase
  .from("profiles")
  .select("*")
  .eq("role", "asesor")
  .order("created_at", { ascending: false })
```

---

## Próximos Pasos (Opcional)

1. **Auditoría de datos:** Ejecutar script de validación mensualmente
2. **Logging:** Agregar logs cuando se cambian roles en el panel admin
3. **Verificación de email:** Requerir confirmación de email antes de mostrar como asesor
4. **Limite de búsqueda:** Crear índice en `profiles(role)` para optimizar queries

---

## Resumen de Cambios

| Componente | Cambio | Beneficio |
|-----------|--------|----------|
| Trigger `handle_new_user()` | Mejorado CASE statement | Captura correcta de `tipo` |
| Panel Admin | `/admin/usuarios-roles` | Monitoreo y edición manual |
| APIs | `/api/admin/users/*` | Gestión de roles desde UI |
| Validación | `scripts/012_validate_advisor_roles.sql` | Detecta inconsistencias |
| Reparación | `scripts/011_fix_advisor_roles.sql` | Fix rápido si es necesario |

---

## Verificación Final

Para confirmar que todo está funcionando:

1. Ve a `/admin/usuarios-roles`
2. Deberías ver 2+ asesores listados (mínimo los placeholders + los que se registraron)
3. Intenta filtrar por "Asesor" - deberían aparecer todos
4. Ve a `/asesores` como alumno - deberían estar visibles todos los asesores

✅ Si ves esto, el sistema está funcionando correctamente.
