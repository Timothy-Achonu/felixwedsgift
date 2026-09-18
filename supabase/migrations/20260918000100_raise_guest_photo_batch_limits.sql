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

  if p_batch_id is null then
    raise exception 'invalid_batch_id';
  end if;
  if p_device_hash is null or btrim(p_device_hash) = '' then
    raise exception 'invalid_device_hash';
  end if;
  if p_files is null or jsonb_typeof(p_files) <> 'array' then
    raise exception 'invalid_files';
  end if;
  requested_count := jsonb_array_length(p_files);
  if requested_count < 1 or requested_count > 50 then
    raise exception 'invalid_file_count';
  end if;
  if (
    select count(distinct item.id)
    from jsonb_to_recordset(p_files) as item(id uuid)
  ) <> requested_count then
    raise exception 'invalid_files';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(p_files) as item(id uuid)
    join public.photo_upload_reservations reservation
      on reservation.id = item.id
    where reservation.batch_id is distinct from p_batch_id
       or reservation.device_hash is distinct from p_device_hash
  ) then
    raise exception 'invalid_files';
  end if;

  select count(*) into new_count
  from jsonb_to_recordset(p_files) as item(id uuid)
  where not exists (
    select 1 from public.photo_upload_reservations reservation
    where reservation.id = item.id
  );

  if (select count(*) from public.photo_upload_reservations
      where device_hash = p_device_hash and created_at > now() - interval '1 hour') + new_count > 100 then
    raise exception 'device_rate_limit';
  end if;
  if p_ip_hash is not null and
     (select count(*) from public.photo_upload_reservations
      where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') + new_count > 2000 then
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

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', id,
      'publicId', cloudinary_public_id,
      'expiresAt', expires_at
    ) order by created_at)
    from public.photo_upload_reservations
    where batch_id = p_batch_id and device_hash = p_device_hash
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.reserve_photo_uploads(uuid, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.reserve_photo_uploads(uuid, text, text, jsonb)
  to service_role;
