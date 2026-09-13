create table if not exists public.admin_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_members enable row level security;

revoke all on table public.admin_members from anon, authenticated;
grant select on table public.admin_members to authenticated;

drop policy if exists "Admins can read their own membership" on public.admin_members;

create policy "Admins can read their own membership"
on public.admin_members
for select
to authenticated
using ((select auth.uid()) = user_id);
