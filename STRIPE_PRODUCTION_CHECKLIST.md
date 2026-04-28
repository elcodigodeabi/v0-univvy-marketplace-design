## Checklist de Producción - Integración Stripe + Univvy

### Configuración completada:
- ✅ Base URL configurada: `https://univvymockups.vercel.app`
- ✅ Webhook endpoint: `https://univvymockups.vercel.app/api/stripe/webhook`
- ✅ STRIPE_WEBHOOK_SECRET añadido
- ✅ SUPABASE_SERVICE_ROLE_KEY configurado
- ✅ Moneda EUR configurada en todas las transacciones

### Funcionalidades implementadas:
- ✅ Checkout Session con redirección a Stripe Checkout
- ✅ Webhook handler con verificación de firma
- ✅ Escrow automático: 10% comisión Univvy
- ✅ Auto-release de escrow 24h post-sesión
- ✅ Reembolsos automáticos en disputa
- ✅ Confirmación de ambos participantes (estudiante + asesor)
- ✅ Página de éxito con detalles del pago

### Seguridad:
- ✅ Verificación de firma Stripe en webhook
- ✅ Validación de metadata en eventos
- ✅ Manejo robusto de errores con logging
- ✅ Queries idempotentes (no duplican registros)
- ✅ RLS policies en Supabase

### Variables de entorno verificadas:
- ✅ STRIPE_SECRET_KEY (privada)
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pública)
- ✅ STRIPE_WEBHOOK_SECRET (privada)
- ✅ NEXT_PUBLIC_BASE_URL = https://univvymockups.vercel.app
- ✅ SUPABASE_SERVICE_ROLE_KEY (privada)
- ✅ NEXT_PUBLIC_SUPABASE_URL (pública)
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (pública)

### Flujo de pago completo:
1. Estudiante busca asesor y clic en "Agendar"
2. Completa formulario de sesión → `/pago/[sessionId]`
3. Sistema calcula precio en EUR: advisor_amount + platform_fee (10%)
4. Clic "Ir a Stripe Checkout" → redirección a Stripe Checkout
5. Usuario completa pago con tarjeta
6. Stripe dispara `checkout.session.completed`
7. Webhook procesa evento → booking confirmado + escrow creado
8. Redirección a `/pago/exito` con detalles
9. 24h después: `auto_release_at` trigger (requiere cron job futuro)

### Testing recomendado:
```
Tarjeta test: 4242 4242 4242 4242
Fecha: Cualquier futura (ej: 12/26)
CVC: Cualquiera (ej: 123)
```

### Próximos pasos opcionales:
- [ ] Cron job para auto-release de escrow cada 24h
- [ ] Confirmación automática si estudiante + asesor confirman
- [ ] Notificaciones por email tras pago exitoso
- [ ] Disputas y resoluciones manuales en admin panel
- [ ] Dashboard de pagos/reportes financieros
- [ ] Conectar Stripe Connect para pagos directos a asesores

### Monitoreo:
- Revisar Stripe Dashboard → Webhooks: eventos procesados sin errores
- Ver Supabase: tabla `bookings` y `payments` con registros correctos
- Logs: `/app/api/stripe/webhook/route.ts` con console.error capturando problemas
