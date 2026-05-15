-- =====================================================
-- UNIVVY - SCHEMA COMPLETO DE BASE DE DATOS
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- Este script crea todas las tablas necesarias para la app
-- =====================================================

-- =====================================================
-- 1. TABLA: profiles (Perfiles de usuarios)
-- Roles: alumno, asesor, administrador
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'alumno' CHECK (role IN ('alumno', 'asesor', 'administrador')),
  universidad TEXT,
  carrera TEXT,
  especialidades TEXT[] DEFAULT '{}',
  bio TEXT,
  phone TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  sesiones_completadas INTEGER DEFAULT 0,
  precio_por_hora INTEGER DEFAULT 0,
  disponibilidad JSONB DEFAULT '{}',
  -- Stripe fields
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT,
  stripe_connect_onboarded BOOLEAN DEFAULT FALSE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Indices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_universidad ON public.profiles(universidad);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating DESC);

-- =====================================================
-- 2. TABLA: bookings (Reservas/Sesiones)
-- Estados: pending_payment, pending_confirmation, confirmed, 
--          in_progress, completed, cancelled, disputed
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  price_cents INTEGER NOT NULL,
  modality TEXT CHECK (modality IN ('virtual', 'presencial')) DEFAULT 'virtual',
  meeting_link TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'pending_confirmation', 'confirmed', 
    'in_progress', 'completed', 'cancelled', 'disputed', 'refunded'
  )),
  notes TEXT,
  cancelled_by UUID,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select" ON public.bookings;
CREATE POLICY "bookings_select" ON public.bookings FOR SELECT 
  USING (auth.uid() = student_id OR auth.uid() = advisor_id);

DROP POLICY IF EXISTS "bookings_insert" ON public.bookings;
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "bookings_update" ON public.bookings;
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE 
  USING (auth.uid() = student_id OR auth.uid() = advisor_id);

-- Indices para bookings
CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_advisor ON public.bookings(advisor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(session_date);

-- =====================================================
-- 3. TABLA: payments (Pagos)
-- Estados: pending, held (escrow), released, refunded, failed, disputed
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER DEFAULT 0,
  advisor_amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'PEN',
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'held', 'released', 'refunded', 'failed', 'disputed'
  )),
  -- Stripe fields
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_transfer_id TEXT,
  -- Confirmation fields
  student_confirmed BOOLEAN DEFAULT NULL,
  advisor_confirmed BOOLEAN DEFAULT NULL,
  confirmation_deadline TIMESTAMPTZ,
  -- Timestamps
  escrow_released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select" ON public.payments;
CREATE POLICY "payments_select" ON public.payments FOR SELECT 
  USING (auth.uid() = student_id OR auth.uid() = advisor_id);

DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_insert" ON public.payments FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "payments_update" ON public.payments;
CREATE POLICY "payments_update" ON public.payments FOR UPDATE 
  USING (auth.uid() = student_id OR auth.uid() = advisor_id);

-- Indices para payments
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_advisor ON public.payments(advisor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- =====================================================
-- 4. TABLA: wallet_balances (Billetera de asesores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_cents INTEGER DEFAULT 0,
  pending_cents INTEGER DEFAULT 0,
  total_earned_cents INTEGER DEFAULT 0,
  total_withdrawn_cents INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para wallet_balances
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_select" ON public.wallet_balances;
CREATE POLICY "wallet_select" ON public.wallet_balances FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallet_insert" ON public.wallet_balances;
CREATE POLICY "wallet_insert" ON public.wallet_balances FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallet_update" ON public.wallet_balances;
CREATE POLICY "wallet_update" ON public.wallet_balances FOR UPDATE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. TABLA: transactions (Historial de transacciones)
-- Tipos: payment, earning, refund, withdrawal, platform_fee
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'earning', 'refund', 'withdrawal', 'platform_fee')),
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Indice para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- =====================================================
-- 6. TABLA: messages (Mensajes entre usuarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Indices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

-- =====================================================
-- 7. TABLA: conversations (Conversaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Indices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_2);

-- =====================================================
-- 8. TABLA: reviews (Reseñas de asesores)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON public.reviews;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);

-- Indices para reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);

-- =====================================================
-- 9. TABLA: disputes (Disputas)
-- Estados: open, under_review, resolved_student, resolved_advisor, closed
-- =====================================================
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  raised_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'resolved_student', 'resolved_advisor', 'closed'
  )),
  admin_notes TEXT,
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "disputes_select" ON public.disputes;
CREATE POLICY "disputes_select" ON public.disputes FOR SELECT 
  USING (
    auth.uid() = raised_by OR 
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id 
      AND (b.student_id = auth.uid() OR b.advisor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "disputes_insert" ON public.disputes;
CREATE POLICY "disputes_insert" ON public.disputes FOR INSERT 
  WITH CHECK (auth.uid() = raised_by);

-- Indices para disputes
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON public.disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- =====================================================
-- 10. TABLA: notifications (Notificaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read_at);

-- =====================================================
-- 11. TABLA: availability_slots (Horarios de disponibilidad)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para availability_slots
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "availability_select" ON public.availability_slots;
CREATE POLICY "availability_select" ON public.availability_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "availability_insert" ON public.availability_slots;
CREATE POLICY "availability_insert" ON public.availability_slots FOR INSERT 
  WITH CHECK (auth.uid() = advisor_id);

DROP POLICY IF EXISTS "availability_update" ON public.availability_slots;
CREATE POLICY "availability_update" ON public.availability_slots FOR UPDATE 
  USING (auth.uid() = advisor_id);

DROP POLICY IF EXISTS "availability_delete" ON public.availability_slots;
CREATE POLICY "availability_delete" ON public.availability_slots FOR DELETE 
  USING (auth.uid() = advisor_id);

-- Indices para availability_slots
CREATE INDEX IF NOT EXISTS idx_availability_advisor ON public.availability_slots(advisor_id);

-- =====================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Crear perfil automáticamente al registrarse
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', NEW.raw_user_meta_data ->> 'tipo', 'alumno')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Actualizar rating promedio del asesor
-- =====================================================
CREATE OR REPLACE FUNCTION update_advisor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM public.reviews 
      WHERE reviewed_id = NEW.reviewed_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE reviewed_id = NEW.reviewed_id
    )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_advisor_rating();

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
