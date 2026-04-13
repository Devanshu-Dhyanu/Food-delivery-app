create extension if not exists pgcrypto;

alter table public.restaurants
add column if not exists delivery_fee numeric not null default 20;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurants_delivery_fee_non_negative'
  ) then
    alter table public.restaurants
    add constraint restaurants_delivery_fee_non_negative
    check (delivery_fee >= 0);
  end if;
end $$;

update public.restaurants
set delivery_fee = 20
where delivery_fee is null;

create index if not exists restaurants_delivery_fee_idx
  on public.restaurants (delivery_fee);

create index if not exists user_profiles_created_at_idx
  on public.user_profiles (created_at desc);

create index if not exists delivery_partner_profiles_created_at_idx
  on public.delivery_partner_profiles (created_at desc);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists admin_users_created_at_idx
  on public.admin_users (created_at desc);

create or replace function public.is_admin_user(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = coalesce(check_user, auth.uid())
  );
$$;

grant execute on function public.is_admin_user(uuid) to authenticated;

create table if not exists public.admin_activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null check (char_length(btrim(event_type)) >= 3),
  title text not null check (char_length(btrim(title)) >= 3),
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_events_created_at_idx
  on public.admin_activity_events (created_at desc);

create index if not exists admin_activity_events_event_type_idx
  on public.admin_activity_events (event_type);

create index if not exists admin_activity_events_actor_user_id_idx
  on public.admin_activity_events (actor_user_id, created_at desc);

comment on table public.admin_activity_events is
  'Streams important customer and system activity into the admin console for realtime operational visibility.';

comment on function public.is_admin_user(uuid) is
  'Returns true when the supplied auth user exists in public.admin_users.';

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  image_url text,
  cta_text text,
  cta_link text,
  audience_type text not null default 'all_users',
  audience_value text,
  priority text not null default 'normal',
  delivery_channel text not null default 'in_app',
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_priority_check check (priority in ('low', 'normal', 'high')),
  constraint announcements_audience_type_check check (audience_type in ('all_users', 'hostel', 'segment')),
  constraint announcements_delivery_channel_check check (delivery_channel in ('in_app', 'push', 'both'))
);

create index if not exists announcements_created_at_idx
  on public.announcements (created_at desc);

create index if not exists announcements_active_window_idx
  on public.announcements (is_active, starts_at, expires_at);

create or replace function public.set_announcements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists announcements_set_updated_at on public.announcements;

create trigger announcements_set_updated_at
before update on public.announcements
for each row
execute function public.set_announcements_updated_at();

grant select, insert, update, delete on public.admin_users to authenticated;
grant select, insert, delete on public.admin_activity_events to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;

alter table public.admin_users enable row level security;
alter table public.admin_activity_events enable row level security;
alter table public.announcements enable row level security;

drop policy if exists admin_users_self_or_admin_select on public.admin_users;
create policy admin_users_self_or_admin_select
on public.admin_users
for select
to authenticated
using (user_id = auth.uid() or public.is_admin_user());

drop policy if exists admin_users_admin_manage on public.admin_users;
create policy admin_users_admin_manage
on public.admin_users
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists admin_activity_events_user_insert on public.admin_activity_events;
create policy admin_activity_events_user_insert
on public.admin_activity_events
for insert
to authenticated
with check (actor_user_id = auth.uid());

drop policy if exists admin_activity_events_admin_select on public.admin_activity_events;
create policy admin_activity_events_admin_select
on public.admin_activity_events
for select
to authenticated
using (public.is_admin_user());

drop policy if exists admin_activity_events_admin_delete on public.admin_activity_events;
create policy admin_activity_events_admin_delete
on public.admin_activity_events
for delete
to authenticated
using (public.is_admin_user());

drop policy if exists announcements_read_active on public.announcements;
create policy announcements_read_active
on public.announcements
for select
to authenticated
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (expires_at is null or expires_at > now())
);

drop policy if exists announcements_admin_manage on public.announcements;
create policy announcements_admin_manage
on public.announcements
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists restaurants_admin_manage on public.restaurants;
create policy restaurants_admin_manage
on public.restaurants
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists menu_items_admin_manage on public.menu_items;
create policy menu_items_admin_manage
on public.menu_items
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists orders_admin_manage on public.orders;
create policy orders_admin_manage
on public.orders
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists order_items_admin_manage on public.order_items;
create policy order_items_admin_manage
on public.order_items
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists user_profiles_admin_manage on public.user_profiles;
create policy user_profiles_admin_manage
on public.user_profiles
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists delivery_feedback_admin_manage on public.delivery_feedback;
create policy delivery_feedback_admin_manage
on public.delivery_feedback
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists order_issue_reports_admin_manage on public.order_issue_reports;
create policy order_issue_reports_admin_manage
on public.order_issue_reports
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists order_cancellation_requests_admin_manage on public.order_cancellation_requests;
create policy order_cancellation_requests_admin_manage
on public.order_cancellation_requests
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists rental_vehicles_admin_manage on public.rental_vehicles;
create policy rental_vehicles_admin_manage
on public.rental_vehicles
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists rental_bookings_admin_manage on public.rental_bookings;
create policy rental_bookings_admin_manage
on public.rental_bookings
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists delivery_partner_profiles_admin_manage on public.delivery_partner_profiles;
create policy delivery_partner_profiles_admin_manage
on public.delivery_partner_profiles
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists marketplace_listings_admin_manage on public.marketplace_listings;
create policy marketplace_listings_admin_manage
on public.marketplace_listings
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists wallet_accounts_admin_manage on public.wallet_accounts;
create policy wallet_accounts_admin_manage
on public.wallet_accounts
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists wallet_transactions_admin_manage on public.wallet_transactions;
create policy wallet_transactions_admin_manage
on public.wallet_transactions
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists payment_transactions_admin_manage on public.payment_transactions;
create policy payment_transactions_admin_manage
on public.payment_transactions
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists payment_refunds_admin_manage on public.payment_refunds;
create policy payment_refunds_admin_manage
on public.payment_refunds
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists delivery_call_sessions_admin_manage on public.delivery_call_sessions;
create policy delivery_call_sessions_admin_manage
on public.delivery_call_sessions
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

do $$
begin
  begin
    alter publication supabase_realtime add table public.admin_activity_events;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end $$;
