-- Create sessions table (tutoring sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  modality TEXT CHECK (modality IN ('virtual', 'presencial')) DEFAULT 'virtual',
  meeting_link TEXT,
  location TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  tutor_amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'escrow', 'released', 'refunded', 'disputed', 'cancelled')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  stripe_checkout_session_id TEXT,
  escrow_released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create escrow_holds table for tracking funds in escrow
CREATE TABLE IF NOT EXISTS public.escrow_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT CHECK (status IN ('held', 'released', 'refunded')) DEFAULT 'held',
  hold_until TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  release_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transactions table for wallet/history
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('payment', 'earning', 'refund', 'withdrawal', 'platform_fee')) NOT NULL,
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wallet_balances table
CREATE TABLE IF NOT EXISTS public.wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_cents INTEGER DEFAULT 0,
  pending_cents INTEGER DEFAULT 0,
  total_earned_cents INTEGER DEFAULT 0,
  total_withdrawn_cents INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view their sessions" ON public.sessions 
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);
CREATE POLICY "Students can create sessions" ON public.sessions 
  FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update sessions" ON public.sessions 
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- Payments policies
CREATE POLICY "Users can view their payments" ON public.payments 
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);
CREATE POLICY "Students can create payments" ON public.payments 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Escrow holds policies
CREATE POLICY "Users can view escrow for their payments" ON public.escrow_holds 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments 
      WHERE payments.id = escrow_holds.payment_id 
      AND (payments.student_id = auth.uid() OR payments.tutor_id = auth.uid())
    )
  );

-- Transactions policies
CREATE POLICY "Users can view their transactions" ON public.transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- Wallet balances policies
CREATE POLICY "Users can view their wallet" ON public.wallet_balances 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their wallet" ON public.wallet_balances 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert wallet" ON public.wallet_balances 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON public.sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_payments_session ON public.payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_tutor ON public.payments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_payment ON public.escrow_holds(payment_id);
