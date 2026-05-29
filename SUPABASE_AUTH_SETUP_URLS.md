# Configuración de URLs de Autenticación en Supabase

## 🔴 PROBLEMA ACTUAL
Los códigos de confirmación de email y recuperación de contraseña **no funcionan en producción** porque Supabase rechaza códigos para URLs que no están en la whitelist.

## ✅ SOLUCIÓN: Agregar URLs Permitidas en Supabase

### Paso 1: Accede a tu Dashboard de Supabase
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto (el que tiene tu base de datos)
3. En el menú izquierdo, ve a **Authentication** → **URL Configuration**

### Paso 2: Copia las URLs Que Debes Agregar

#### Para DESARROLLO (localhost):
\`\`\`
http://localhost:3000
http://localhost:3000/
\`\`\`

#### Para PRODUCCIÓN (Vercel):
Reemplaza `TU_URL_VERCEL` con tu URL real de Vercel. Puede ser:
- `https://v0-univvy-marketplace-design.vercel.app` (URL default de Vercel)
- O tu dominio personalizado (ej: `https://univvy.com`)

\`\`\`
https://TU_URL_VERCEL
https://TU_URL_VERCEL/
\`\`\`

### Paso 3: Agregar las URLs en Supabase

En la sección **"Redirect URLs"** (o "Site URLs"):

1. Haz clic en el campo de entrada de URLs
2. Pega cada URL en una línea nueva:

\`\`\`
http://localhost:3000
https://v0-univvy-marketplace-design.vercel.app
\`\`\`

Si tienes un dominio personalizado, agrega también:
\`\`\`
https://tudominio.com
\`\`\`

3. Haz clic en **Save** o **Update**

---

## 📋 URLs de Callback (Para referencia)

Estos son los callbacks automáticos que tu app usa. **NO necesitas agregarlos manualmente**, pero sirven como referencia:

| Operación | URL |
|-----------|-----|
| Confirmación de Email (Registro) | `/auth/verify` |
| Recuperación de Contraseña | `/auth/recover` |
| Callback General | `/auth/callback` |

Ejemplos completos:
- `http://localhost:3000/auth/verify`
- `https://v0-univvy-marketplace-design.vercel.app/auth/verify`
- `http://localhost:3000/auth/recover`
- `https://v0-univvy-marketplace-design.vercel.app/auth/recover`

---

## 🔧 Variables de Entorno Verificadas

Tu proyecto ya tiene estas variables configuradas correctamente:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
\`\`\`

✅ Estas están bien. **No necesitas cambiarlas.**

---

## ✨ Después de Agregar las URLs

1. **Registra un usuario de prueba** con un email real
2. Verifica que **recibas el email de confirmación** en tu inbox
3. Haz clic en el link del email (debe ser de tu dominio de Vercel)
4. Deberías ser redirigido a `/auth/verify` y luego a tu dashboard

Si el email no llega:
- Revisa la **carpeta de SPAM**
- Espera 30 segundos y recarga la página

Si el link no funciona después de 24 horas:
- Los códigos **expiran después de 24 horas**
- Pide un nuevo enlace en la página de login

---

## 🐛 Si Aún Tienes Problemas

1. Limpia la caché del navegador (Ctrl+Shift+Delete)
2. Prueba en una **ventana privada/incógnito**
3. Verifica que el email esté correcto en el formulario de registro
4. Asegúrate de que las URLs no tengan espacios en blanco extras

---

## 📞 Referencias Útiles

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Configuración de Redirect URLs en Supabase](https://supabase.com/docs/guides/auth/overview#redirect-urls)
