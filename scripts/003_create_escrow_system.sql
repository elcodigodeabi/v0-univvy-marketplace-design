-- Escrow payment system tables
-- Run this script to create the necessary tables for the escrow system

-- Bookings table (reservas)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  provider_id uuid not null,
  meeting_time timestamp with time zone not null,
  duration_minutes integer default 60,
  subject text,
  modality text default 'virtual',
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'dispute', 'refunded')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Payments table (pagos)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  platform_fee_cents integer default 0,
  provider_amount_cents integer not null,
  currency text default 'usd',
  status text default 'held' check (status in ('pending', 'held', 'released', 'refunded', 'dispute', 'failed')),
  client_confirmed boolean default null,
  provider_confirmed boolean default null,
  confirmation_deadline timestamp with time zone,
  released_at timestamp with time zone,
  refunded_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Disputes table
create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  raised_by uuid not null,
  reason text,
  status text default 'open' check (status in ('open', 'resolved_client', 'resolved_provider', 'closed')),
  admin_notes text,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.disputes enable row level security;

-- Bookings policies
create policy "Users can view their bookings" on public.bookings
  for select using (true);

create policy "Users can insert bookings" on public.bookings
  for insert with check (true);

create policy "Users can update their bookings" on public.bookings
  for update using (true);

-- Payments policies
create policy "Users can view payments" on public.payments
  for select using (true);

create policy "Users can insert payments" on public.payments
  for insert with check (true);

create policy "Users can update payments" on public.payments
  for update using (true);

-- Disputes policies
create policy "Users can view disputes" on public.disputes
  for select using (true);

create policy "Users can insert disputes" on public.disputes
  for insert with check (true);

create policy "Users can update disputes" on public.disputes
  for update using (true);
