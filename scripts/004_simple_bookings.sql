-- Create bookings table for session management
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  advisor_id uuid not null,
  subject text not null,
  session_date date not null,
  session_time text not null,
  duration_minutes integer default 60,
  price_cents integer not null,
  modality text default 'virtual',
  status text default 'pending_payment',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  stripe_payment_intent_id text,
  amount_cents integer not null,
  platform_fee_cents integer default 0,
  advisor_amount_cents integer not null,
  status text default 'pending',
  escrow_released_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.bookings enable row level security;
alter table public.payments enable row level security;

-- Simple policies for bookings
create policy "bookings_select" on public.bookings for select using (true);
create policy "bookings_insert" on public.bookings for insert with check (true);
create policy "bookings_update" on public.bookings for update using (true);

-- Simple policies for payments
create policy "payments_select" on public.payments for select using (true);
create policy "payments_insert" on public.payments for insert with check (true);
create policy "payments_update" on public.payments for update using (true);
