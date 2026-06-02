# Configuración de URLs de Recuperación de Contraseña en Supabase

## El Problema

Cuando haces click en el enlace de recuperación de contraseña que llega al email, Supabase te redirige a `https://univvyorg.com/?code=...` en lugar de a la página de reset.

## La Solución

Necesitas actualizar las URLs de redireccionamiento en Supabase para que incluya `/auth/recover`.

---

## Pasos para Arreglarlo

### 1. Abre tu Dashboard de Supabase
- Ve a: https://app.supabase.com
- Selecciona tu proyecto

### 2. Ve a Configuración de Autenticación
- En el menu izquierdo, haz click en: **Authentication**
- Luego haz click en: **URL Configuration**

### 3. Actualiza las URLs

En la sección **"Redirect URLs"**, agrega ESTAS tres URLs:

\`\`\`
http://localhost:3000
http://localhost:3000/auth/recover
https://univvyorg.com
https://univvyorg.com/auth/recover
\`\`\`

**Copia exactamente como están arriba**, una por línea.

### 4. Guarda los Cambios

- Haz click en el botón **"Save"** en la esquina inferior derecha

---

## Resultado

Después de guardar, deberías ver:

\`\`\`
✅ Site URL: https://univvyorg.com
✅ Allowed Redirect URLs:
   - http://localhost:3000
   - http://localhost:3000/auth/recover
   - https://univvyorg.com
   - https://univvyorg.com/auth/recover
\`\`\`

---

## ¿Por Qué Funciona Ahora?

1. **Nuevo flujo de recuperación:**
   - Supabase envía el email con un link a `https://univvyorg.com/?code=XXXXX`
   - La página de inicio (`/`) detecta el código automáticamente
   - Te redirige a `/auth/recover?code=XXXXX`
   - La página de recovery procesa el token y te lleva a `/nueva-password`
   - ¡Completamente transparente para ti!

2. **También funciona si Supabase redirige directamente a `/auth/recover`:**
   - Si actualizas la configuración en Supabase, también funcionará sin el redirect automático

---

## Próxima Vez que Recuperes Contraseña

1. Ve a https://univvyorg.com/recuperar-password
2. Ingresa tu email
3. Abre el email que recibirás
4. Haz click en el link
5. **Debería llevarte directamente al formulario para ingresar tu nueva contraseña** ✅

---

## Si Aún No Funciona

1. **Borra los datos del navegador:**
   - Presiona F12
   - DevTools → Application → Clear site data
   - Recarga la página

2. **Verifica los logs:**
   - Presiona F12 en la página de recuperación
   - Mira la consola (Console tab)
   - Busca mensajes que comiencen con `[v0]`

3. **Contacta si persiste:**
   - Los logs mostrarán el error exacto
