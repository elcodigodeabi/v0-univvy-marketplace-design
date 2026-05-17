# Configuración de URLs de Autenticación en Supabase

## Problema
Los códigos de confirmación de email y recuperación de contraseña fallan en producción porque Supabase necesita tener explícitamente permitidas las URLs desde donde se van a usar.

## Solución

### Paso 1: Acceder al Dashboard de Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. Ve a **Authentication** en el menú izquierdo

### Paso 2: Configurar URLs Permitidas
1. En el menú de **Authentication**, haz clic en **URL Configuration**
2. En la sección **Site URL**, asegúrate de que está configurado correctamente:
   - Para desarrollo: `http://localhost:3000`
   - Para producción: `https://tu-dominio-vercel.app` (tu URL real de Vercel)

3. En la sección **Redirect URLs**, agrega estas URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/verify
   http://localhost:3000/auth/recover
   https://tu-dominio-vercel.app/auth/callback
   https://tu-dominio-vercel.app/auth/verify
   https://tu-dominio-vercel.app/auth/recover
   ```

### Paso 3: Habilitar Confirmación de Email (Opcional pero recomendado)
1. En **Authentication**, ve a **Providers**
2. Selecciona **Email**
3. Asegúrate de que está habilitado y configura:
   - **Confirm email**: ON (si quieres que confirmen email antes de acceder)
   - **Double confirm changes**: ON (para cambios de email)

### Paso 4: Guardar Cambios
- Click en **Save** para confirmar todos los cambios

## URLs de Vercel
Para obtener tu URL de Vercel correcta:
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. En **Deployments**, busca el dominio principal (ej: `univvy-marketplace-design.vercel.app`)
4. O si tiene dominio personalizado, úsalo en lugar del `.vercel.app`

## Pruebas
Después de guardar:
1. En desarrollo (localhost): los emails funcionarán normalmente
2. En producción: prueba enviando un email de confirmación desde la URL de Vercel
3. Si sigue fallando, revisa los logs de Supabase en **Auth → Logs**

## Notas Importantes
- Asegúrate de NO incluir rutas específicas en "Site URL", solo el dominio base
- Los "Redirect URLs" SÍ pueden incluir rutas específicas
- Si cambias de dominio, actualiza estas URLs
- Los cambios pueden tardar unos minutos en aplicarse completamente
