-- Política financiera Univvy: retenciones y pagos pendientes de cobro
-- (Aplicado en Supabase como migración: financial_policies_pending_payout)

-- 1) Nuevo estado 'pending_payout' para pagos de asesores sin Stripe configurado
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'in_escrow', 'pending_payout', 'released', 'refunded', 'failed'));

-- 2) Campos de payout (retención y pago manual)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS pending_payout_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payout_method TEXT
  CHECK (payout_method IN ('stripe', 'bank_transfer'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payout_note TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payout_marked_by UUID REFERENCES public.profiles(id);

-- 3) Índices para el cron de liberación automática y el panel admin
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_bookings_auto_release
  ON public.bookings(auto_release_at)
  WHERE auto_release_at IS NOT NULL;
