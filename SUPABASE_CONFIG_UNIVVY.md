# Configuración de Supabase para Univvy

## URLs que debes agregar en Supabase

**IMPORTANTE**: Copia estas URLs exactamente como aparecen aquí.

### Para Desarrollo (localhost)
\`\`\`
http://localhost:3000
\`\`\`

### Para Producción (Univvy)
\`\`\`
https://univvyorg.com
\`\`\`

---

## Paso a Paso en Dashboard de Supabase

1. **Abre tu Supabase Dashboard**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Ve a Configuración de Autenticación**
   - Click izquierdo en el menú: **Authentication**
   - Luego click en: **URL Configuration**

3. **Agrega las URLs**
   
   **Site URL** (la URL principal):
   \`\`\`
   https://univvyorg.com
   \`\`\`

   **Redirect URLs** (URLs permitidas para confirmación de email):
   \`\`\`
   http://localhost:3000
   https://univvyorg.com
   \`\`\`

4. **Guarda los cambios**
   - Click en el botón **Save** en la esquina inferior derecha

---

## Verificación

Después de guardar, debería verse así:

\`\`\`
✅ Site URL: https://univvyorg.com
✅ Allowed Redirect URLs:
   - http://localhost:3000
   - https://univvyorg.com
\`\`\`

---

## ¿Por qué funciona?

Cuando un usuario se registra o solicita recuperar contraseña:

1. **Supabase envía un email** con un código único
2. **El código se vincula a la URL** que configuraste (Site URL)
3. **Cuando el usuario hace click en el link**, va a `https://univvyorg.com/auth/verify` o similar
4. **Supabase valida** que esa URL esté en la lista de "Allowed Redirect URLs"
5. **Si está permitida**, el código funciona ✅
6. **Si NO está permitida**, rechaza el código ❌

---

## Problemas Comunes

### "Enlace inválido o ha expirado"
→ Significa que tu URL de producción NO está en Supabase

### Funciona en localhost pero no en producción
→ Olvidaste agregar `https://univvyorg.com`

### Funciona en producción pero no en localhost
→ Olvidaste agregar `http://localhost:3000`

---

## Después de configurar

Una vez hayas hecho esto, prueba:

1. **En localhost**: 
   - Ve a http://localhost:3000/registro
   - Regístrate con un email
   - Confirma el email desde el enlace

2. **En producción**:
   - Ve a https://univvyorg.com/registro
   - Regístrate con un email
   - Confirma el email desde el enlace

Debería funcionar en ambos lugares. ✅
