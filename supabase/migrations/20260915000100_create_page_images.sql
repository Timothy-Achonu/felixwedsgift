create table if not exists public.page_images (
  slot text primary key check (slot in ('hero_desktop', 'hero_mobile', 'story_primary', 'story_inset', 'venue')),
  cloudinary_public_id text not null,
  secure_url text not null,
  alt text not null check (length(trim(alt)) > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  focal_x numeric(4, 3) not null default 0.5 check (focal_x between 0 and 1),
  focal_y numeric(4, 3) not null default 0.5 check (focal_y between 0 and 1),
  updated_at timestamptz not null default now()
);

alter table public.page_images enable row level security;
revoke all on table public.page_images from anon, authenticated;
grant select on table public.page_images to anon, authenticated;
grant insert, update on table public.page_images to authenticated;

drop policy if exists "Anyone can read published page images" on public.page_images;
drop policy if exists "Admins can read page images" on public.page_images;
drop policy if exists "Admins can insert page images" on public.page_images;
drop policy if exists "Admins can update page images" on public.page_images;

create policy "Anyone can read published page images"
on public.page_images for select to anon, authenticated
using (exists (
  select 1 from public.wedding_settings
  where id = 1 and is_published = true
));

create policy "Admins can read page images"
on public.page_images for select to authenticated
using (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
));

create policy "Admins can insert page images"
on public.page_images for insert to authenticated
with check (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
));

create policy "Admins can update page images"
on public.page_images for update to authenticated
using (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
));
