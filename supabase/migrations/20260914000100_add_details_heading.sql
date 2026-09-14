alter table public.wedding_settings
  add column if not exists details_heading text not null default 'Meet us in Lagos';
