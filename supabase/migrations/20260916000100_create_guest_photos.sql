create table if not exists public.photo_upload_reservations (
  id uuid primary key,
  batch_id uuid not null,
  cloudinary_public_id text not null unique,
  original_filename text not null check (length(original_filename) between 1 and 255),
  declared_mime_type text not null check (declared_mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  declared_bytes integer not null check (declared_bytes between 1 and 10000000),
  device_hash text not null,
  ip_hash text,
  expires_at timestamptz not null,
  completed_at timestamptz,
  cleaned_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key references public.photo_upload_reservations (id),
  cloudinary_public_id text not null unique,
  secure_url text not null,
  cloudinary_delivery_type text not null default 'authenticated'
    check (cloudinary_delivery_type in ('authenticated', 'upload')),
  original_filename text not null check (length(original_filename) between 1 and 255),
  width integer not null check (width between 1 and 8192),
  height integer not null check (height between 1 and 8192),
  format text not null check (format in ('jpg', 'jpeg', 'png', 'webp')),
  bytes integer not null check (bytes between 1 and 10000000),
  caption text check (caption is null or length(caption) <= 240),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  check (
    (status = 'APPROVED' and cloudinary_delivery_type = 'upload' and approved_at is not null)
    or (status <> 'APPROVED' and cloudinary_delivery_type = 'authenticated' and approved_at is null)
  )
);

create index if not exists photo_upload_reservations_device_rate_idx
  on public.photo_upload_reservations (device_hash, created_at desc);
create index if not exists photo_upload_reservations_ip_rate_idx
  on public.photo_upload_reservations (ip_hash, created_at desc)
  where ip_hash is not null;
create index if not exists photo_upload_reservations_expiry_idx
  on public.photo_upload_reservations (expires_at)
  where completed_at is null and cleaned_at is null;
create index if not exists photos_status_created_idx
  on public.photos (status, created_at desc, id desc);
create index if not exists photos_approved_cursor_idx
  on public.photos (approved_at desc, id desc)
  where status = 'APPROVED';

alter table public.photo_upload_reservations enable row level security;
alter table public.photos enable row level security;

revoke all on table public.photo_upload_reservations from anon, authenticated;
revoke all on table public.photos from anon, authenticated;
grant select (id, secure_url, width, height, caption, approved_at) on public.photos to anon;
grant select, update, delete on public.photos to authenticated;

create policy "Anyone can read approved photos"
on public.photos for select to anon
using (
  status = 'APPROVED'
  and exists (
    select 1 from public.wedding_settings
    where id = 1 and is_published = true
  )
);

create policy "Admins can read photos"
on public.photos for select to authenticated
using (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
));

create policy "Admins can update photos"
on public.photos for update to authenticated
using (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
));

create policy "Admins can delete photos"
on public.photos for delete to authenticated
using (exists (
  select 1 from public.admin_members
  where user_id = (select auth.uid())
));

create or replace function public.reserve_photo_uploads(
  p_batch_id uuid,
  p_device_hash text,
  p_ip_hash text,
  p_files jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  requested_count integer;
  new_count integer;
  retained_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('felix-gift-photo-upload-capacity'));

  if jsonb_typeof(p_files) <> 'array' then
    raise exception 'invalid_files';
  end if;
  requested_count := jsonb_array_length(p_files);
  if requested_count < 1 or requested_count > 10 then
    raise exception 'invalid_file_count';
  end if;

  select count(*) into new_count
  from jsonb_to_recordset(p_files) as item(id uuid)
  where not exists (
    select 1 from public.photo_upload_reservations reservation
    where reservation.id = item.id
      and reservation.batch_id = p_batch_id
      and reservation.device_hash = p_device_hash
  );

  if (select count(*) from public.photo_upload_reservations
      where device_hash = p_device_hash and created_at > now() - interval '1 hour') + new_count > 30 then
    raise exception 'device_rate_limit';
  end if;
  if p_ip_hash is not null and
     (select count(*) from public.photo_upload_reservations
      where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') + new_count > 200 then
    raise exception 'ip_rate_limit';
  end if;

  select
    (select count(*) from public.photos)
    + (select count(*) from public.photo_upload_reservations
       where completed_at is null and cleaned_at is null and expires_at > now())
  into retained_count;
  if retained_count + new_count > 500 then
    raise exception 'photo_capacity_reached';
  end if;

  insert into public.photo_upload_reservations (
    id, batch_id, cloudinary_public_id, original_filename,
    declared_mime_type, declared_bytes, device_hash, ip_hash, expires_at
  )
  select item.id, p_batch_id, item.public_id, item.name, item.mime_type,
         item.bytes, p_device_hash, p_ip_hash, now() + interval '30 minutes'
  from jsonb_to_recordset(p_files) as item(
    id uuid, public_id text, name text, mime_type text, bytes integer
  )
  on conflict (id) do nothing;

  return (
    select jsonb_agg(jsonb_build_object(
      'id', id,
      'publicId', cloudinary_public_id,
      'expiresAt', expires_at
    ) order by created_at)
    from public.photo_upload_reservations
    where batch_id = p_batch_id and device_hash = p_device_hash
  );
end;
$$;

revoke all on function public.reserve_photo_uploads(uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.reserve_photo_uploads(uuid, text, text, jsonb) to service_role;
