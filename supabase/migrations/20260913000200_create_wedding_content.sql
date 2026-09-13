create table if not exists public.wedding_settings (
  id smallint primary key default 1 check (id = 1),
  partner_one_name text not null,
  partner_two_name text not null,
  wedding_date timestamptz not null,
  timezone text not null default 'Africa/Lagos',
  ceremony_time text not null,
  reception_time text not null,
  venue_name text not null,
  venue_address text not null,
  dress_code text not null,
  directions_url text not null,
  hero_eyebrow text not null,
  hero_message text not null,
  story_heading text not null,
  story_introduction text not null,
  story_body text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  time_label text not null,
  title text not null,
  description text,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists schedule_items_sort_order_idx
  on public.schedule_items (sort_order, created_at, id);

alter table public.wedding_settings enable row level security;
alter table public.schedule_items enable row level security;

revoke all on table public.wedding_settings, public.schedule_items from anon, authenticated;
grant select on table public.wedding_settings, public.schedule_items to anon, authenticated;
grant insert, update, delete on table public.wedding_settings, public.schedule_items to authenticated;

drop policy if exists "Anyone can read published wedding settings" on public.wedding_settings;
drop policy if exists "Admins can read all wedding settings" on public.wedding_settings;
drop policy if exists "Admins can insert wedding settings" on public.wedding_settings;
drop policy if exists "Admins can update wedding settings" on public.wedding_settings;
drop policy if exists "Admins can delete wedding settings" on public.wedding_settings;

create policy "Anyone can read published wedding settings"
on public.wedding_settings
for select
to anon, authenticated
using (is_published = true);

create policy "Admins can read all wedding settings"
on public.wedding_settings
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

create policy "Admins can insert wedding settings"
on public.wedding_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

create policy "Admins can update wedding settings"
on public.wedding_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

create policy "Admins can delete wedding settings"
on public.wedding_settings
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

drop policy if exists "Anyone can read published schedule" on public.schedule_items;
drop policy if exists "Admins can read schedule" on public.schedule_items;
drop policy if exists "Admins can insert schedule" on public.schedule_items;
drop policy if exists "Admins can update schedule" on public.schedule_items;
drop policy if exists "Admins can delete schedule" on public.schedule_items;

create policy "Anyone can read published schedule"
on public.schedule_items
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.wedding_settings
    where wedding_settings.id = 1
      and wedding_settings.is_published = true
  )
);

create policy "Admins can read schedule"
on public.schedule_items
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

create policy "Admins can insert schedule"
on public.schedule_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

create policy "Admins can update schedule"
on public.schedule_items
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);

create policy "Admins can delete schedule"
on public.schedule_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_members
    where admin_members.user_id = (select auth.uid())
  )
);
