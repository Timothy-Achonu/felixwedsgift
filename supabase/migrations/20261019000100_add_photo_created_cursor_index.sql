create index if not exists photos_created_cursor_idx
  on public.photos (created_at desc, id desc);
