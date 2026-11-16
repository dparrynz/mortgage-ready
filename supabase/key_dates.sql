-- Key dates for the First Home Playbook journey (offer accepted to settlement)
-- and the pieces the daily reminder email job needs.
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- What it does:
--   1. Creates a key_dates table: one row per account, holding only the dates
--      and short labels the person entered, whether they want reminders, and
--      which reminders have already gone out.
--   2. Locks it down so each signed-in person can only see and change their
--      own row (row level security).
--   3. Adds two functions the reminder job calls. They only work with a
--      secret that is kept in Vercel, so nobody else can use them. The job
--      can read the email address and dates of people who turned reminders
--      on, and tick a reminder off as sent. Nothing else.

create table if not exists public.key_dates (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  dates      jsonb not null default '{}'::jsonb,
  reminders  boolean not null default false,
  sent       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint key_dates_dates_small check (pg_column_size(dates) < 8000),
  constraint key_dates_sent_small  check (pg_column_size(sent) < 8000)
);

alter table public.key_dates enable row level security;

revoke all on public.key_dates from anon;
grant select, insert, update, delete on public.key_dates to authenticated;

drop policy if exists "key_dates_select_own" on public.key_dates;
drop policy if exists "key_dates_insert_own" on public.key_dates;
drop policy if exists "key_dates_update_own" on public.key_dates;
drop policy if exists "key_dates_delete_own" on public.key_dates;

create policy "key_dates_select_own" on public.key_dates
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "key_dates_insert_own" on public.key_dates
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "key_dates_update_own" on public.key_dates
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "key_dates_delete_own" on public.key_dates
  for delete to authenticated using ((select auth.uid()) = user_id);

-- The secret for the reminder job lives in a schema the public API can't
-- reach, and only as a hash, so reading the database never reveals it.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table if not exists private.reminder_secret (
  id   boolean primary key default true check (id),
  hash text not null
);
revoke all on private.reminder_secret from anon, authenticated;

-- People with reminders on, for the daily job to work out who is due one
create or replace function public.key_date_reminders_due(p_secret text)
returns table (user_id uuid, email text, first_name text, dates jsonb, sent jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.reminder_secret s
    where s.hash = encode(sha256(convert_to(coalesce(p_secret, ''), 'UTF8')), 'hex')
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
    select k.user_id,
           u.email::text,
           coalesce(
             nullif(u.raw_user_meta_data ->> 'first_name', ''),
             nullif(split_part(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), ' ', 1), '')
           ),
           k.dates,
           k.sent
    from public.key_dates k
    join auth.users u on u.id = k.user_id
    where k.reminders and u.email is not null;
end;
$$;

-- Tick one reminder off as sent (p_key is the date it was for)
create or replace function public.key_date_reminder_mark_sent(p_secret text, p_user uuid, p_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.reminder_secret s
    where s.hash = encode(sha256(convert_to(coalesce(p_secret, ''), 'UTF8')), 'hex')
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_key !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'bad key';
  end if;
  update public.key_dates k
     set sent = k.sent || jsonb_build_object(p_key, true)
   where k.user_id = p_user;
end;
$$;

revoke execute on function public.key_date_reminders_due(text) from public, authenticated;
revoke execute on function public.key_date_reminder_mark_sent(text, uuid, text) from public, authenticated;
grant execute on function public.key_date_reminders_due(text) to anon;
grant execute on function public.key_date_reminder_mark_sent(text, uuid, text) to anon;

-- One more step, done separately so the secret never sits in this file:
--   insert into private.reminder_secret (hash) values ('<sha256 of REMINDERS_SECRET>')
--   on conflict (id) do update set hash = excluded.hash;
