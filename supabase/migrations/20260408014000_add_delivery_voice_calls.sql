create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.delivery_call_sessions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  channel_name text not null unique
    check (char_length(btrim(channel_name)) between 8 and 80),
  caller_user_id uuid not null references auth.users(id) on delete cascade,
  caller_role text not null check (caller_role in ('customer', 'delivery_partner')),
  caller_label text
    check (caller_label is null or char_length(btrim(caller_label)) >= 2),
  receiver_user_id uuid not null references auth.users(id) on delete cascade,
  receiver_role text not null check (receiver_role in ('customer', 'delivery_partner')),
  receiver_label text
    check (receiver_label is null or char_length(btrim(receiver_label)) >= 2),
  status text not null default 'ringing'
    check (status in ('ringing', 'accepted', 'declined', 'ended', 'missed', 'cancelled', 'failed')),
  initiated_at timestamptz not null default now(),
  accepted_at timestamptz,
  ended_at timestamptz,
  ended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_call_sessions_participants_check check (
    caller_user_id <> receiver_user_id
    and caller_role <> receiver_role
  )
);

create unique index if not exists delivery_call_sessions_live_order_idx
  on public.delivery_call_sessions(order_id)
  where status in ('ringing', 'accepted');

create index if not exists delivery_call_sessions_caller_user_id_idx
  on public.delivery_call_sessions(caller_user_id);

create index if not exists delivery_call_sessions_receiver_user_id_idx
  on public.delivery_call_sessions(receiver_user_id);

create index if not exists delivery_call_sessions_status_idx
  on public.delivery_call_sessions(status);

create or replace function public.guard_delivery_call_session_identity()
returns trigger
language plpgsql
as $$
begin
  if old.order_id is distinct from new.order_id
    or old.channel_name is distinct from new.channel_name
    or old.caller_user_id is distinct from new.caller_user_id
    or old.caller_role is distinct from new.caller_role
    or old.receiver_user_id is distinct from new.receiver_user_id
    or old.receiver_role is distinct from new.receiver_role then
    raise exception 'Immutable delivery call session fields cannot be changed';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

alter table public.delivery_call_sessions enable row level security;

drop trigger if exists guard_delivery_call_session_identity on public.delivery_call_sessions;

create trigger guard_delivery_call_session_identity
before update on public.delivery_call_sessions
for each row
execute function public.guard_delivery_call_session_identity();

drop policy if exists "Participants can view delivery call sessions" on public.delivery_call_sessions;
drop policy if exists "Participants can create delivery call sessions" on public.delivery_call_sessions;
drop policy if exists "Participants can update delivery call sessions" on public.delivery_call_sessions;

create policy "Participants can view delivery call sessions"
  on public.delivery_call_sessions for select
  to authenticated
  using (auth.uid() = caller_user_id or auth.uid() = receiver_user_id);

create policy "Participants can create delivery call sessions"
  on public.delivery_call_sessions for insert
  to authenticated
  with check (
    auth.uid() = caller_user_id
    and caller_user_id <> receiver_user_id
    and caller_role <> receiver_role
    and exists (
      select 1
      from public.orders
      where orders.id = delivery_call_sessions.order_id
        and (
          (
            delivery_call_sessions.caller_role = 'customer'
            and delivery_call_sessions.receiver_role = 'delivery_partner'
            and orders.user_id = auth.uid()
            and orders.delivery_partner_user_id = delivery_call_sessions.receiver_user_id
            and orders.delivery_assignment_status in ('assigned', 'picked_up')
          )
          or (
            delivery_call_sessions.caller_role = 'delivery_partner'
            and delivery_call_sessions.receiver_role = 'customer'
            and orders.delivery_partner_user_id = auth.uid()
            and orders.user_id = delivery_call_sessions.receiver_user_id
            and orders.delivery_assignment_status in ('assigned', 'picked_up')
          )
        )
    )
  );

create policy "Participants can update delivery call sessions"
  on public.delivery_call_sessions for update
  to authenticated
  using (auth.uid() = caller_user_id or auth.uid() = receiver_user_id)
  with check (auth.uid() = caller_user_id or auth.uid() = receiver_user_id);
