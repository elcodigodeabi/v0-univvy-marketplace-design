-- =====================================================
-- UNIVVY - TABLA: bank_transfers (Transferencias bancarias)
-- =====================================================
-- Estados:
--   pending          → el cliente vio los datos bancarios y aún no ha enviado
--   proof_uploaded   → el cliente subió el comprobante, esperando validación
--   validated        → el admin validó la transferencia, booking → confirmed
--   rejected         → el admin rechazó el comprobante (datos incorrectos, etc.)
--   refunded         → se devolvió el importe al cliente
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bank_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación con la reserva
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,

  -- Quién realiza el pago
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Importe en céntimos de euro
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  advisor_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Estado del trámite
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'proof_uploaded', 'validated', 'rejected', 'refunded'
  )),

  -- Datos que el cliente indica al hacer la transferencia
  transfer_reference TEXT,          -- Referencia que el cliente usa al transferir
  transfer_date DATE,               -- Fecha indicada por el cliente
  transfer_time TIME,               -- Hora indicada por el cliente

  -- Comprobante subido por el cliente (URL en Supabase Storage / Blob)
  proof_url TEXT,
  proof_uploaded_at TIMESTAMPTZ,

  -- Cuenta bancaria receptora (copiada en el momento del pago para trazabilidad)
  bank_name TEXT,
  bank_iban TEXT,
  bank_account_holder TEXT,
  bank_swift TEXT,

  -- Validación por el administrador
  validated_by UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para bank_transfers
ALTER TABLE public.bank_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bank_transfers_select" ON public.bank_transfers;
CREATE POLICY "bank_transfers_select" ON public.bank_transfers FOR SELECT
  USING (
    auth.uid() = payer_id
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.advisor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "bank_transfers_insert" ON public.bank_transfers;
CREATE POLICY "bank_transfers_insert" ON public.bank_transfers FOR INSERT
  WITH CHECK (auth.uid() = payer_id);

DROP POLICY IF EXISTS "bank_transfers_update" ON public.bank_transfers;
CREATE POLICY "bank_transfers_update" ON public.bank_transfers FOR UPDATE
  USING (auth.uid() = payer_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bank_transfers_booking ON public.bank_transfers(booking_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_payer ON public.bank_transfers(payer_id);
CREATE INDEX IF NOT EXISTS idx_bank_transfers_status ON public.bank_transfers(status);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_bank_transfers_updated_at ON public.bank_transfers;
CREATE TRIGGER update_bank_transfers_updated_at
  BEFORE UPDATE ON public.bank_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Variables de entorno necesarias para la cuenta receptora
-- =====================================================
-- BANK_ACCOUNT_HOLDER  → Nombre del titular (ej: "Univvy SL")
-- BANK_IBAN            → IBAN completo (ej: "ES91 2100 0418 4502 0005 1332")
-- BANK_SWIFT           → BIC/SWIFT (ej: "CAIXESBBXXX")
-- BANK_NAME            → Nombre del banco (ej: "CaixaBank")
-- =====================================================
