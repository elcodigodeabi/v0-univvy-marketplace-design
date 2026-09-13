-- Prevent two active bookings from overlapping for the same advisor.
-- Run this migration in the connected Supabase project before deploying the app changes.
create extension if not exists btree_gist;

create index if not exists bookings_advisor_schedule_status_idx
  on public.bookings (advisor_id, scheduled_at, status);

alter table public.bookings
  drop constraint if exists bookings_advisor_active_slot_exclusion;

alter table public.bookings
  add constraint bookings_advisor_active_slot_exclusion
  exclude using gist (
    advisor_id with =,
    tstzrange(scheduled_at, scheduled_at + make_interval(mins => duration_minutes), '[)') with &&
  ) where (status in ('pending_request', 'pending_payment', 'confirmed', 'in_progress'));

create or replace function public.expire_unpaid_bookings()
returns integer
language sql
security invoker
set search_path = public
as $$
  with expired as (
    update public.bookings
    set status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = 'checkout_expired',
        updated_at = now()
    where status in ('pending_request', 'pending_payment')
      and created_at < now() - interval '30 minutes'
    returning id
  )
  select count(*)::integer from expired;
$$;

revoke execute on function public.expire_unpaid_bookings() from anon, authenticated;

comment on constraint bookings_advisor_active_slot_exclusion on public.bookings is
  'Prevents overlapping active bookings for the same advisor, including concurrent requests.';

-- Verification query:
-- select advisor_id, scheduled_at, duration_minutes, status from public.bookings
-- where status in ('pending_request', 'pending_payment', 'confirmed', 'in_progress');

-- Verification query for unpaid leftovers:
-- select public.expire_unpaid_bookings();

-- Note: if historical overlapping rows exist, resolve them before applying the constraint.
-- The exclusion constraint is the final concurrency guard; UI checks are only advisory.
