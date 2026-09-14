-- Development-only sample data. Do not run this against production.
insert into public.wedding_settings (
  id,
  partner_one_name,
  partner_two_name,
  wedding_date,
  timezone,
  ceremony_time,
  reception_time,
  venue_name,
  venue_address,
  dress_code,
  directions_url,
  hero_eyebrow,
  hero_message,
  story_heading,
  story_introduction,
  story_body,
  details_heading,
  is_published
)
values (
  1,
  'Felix',
  'Gift',
  '2026-12-18T14:00:00+01:00',
  'Africa/Lagos',
  '2:00 PM',
  '4:30 PM',
  'The Garden Estate',
  'Lagos, Nigeria',
  'Formal / Elegantly colourful',
  'https://www.google.com/maps/search/?api=1&query=The+Garden+Estate+Lagos+Nigeria',
  'With full hearts',
  'We are getting married',
  'We found home in each other.',
  'Two lives, one unfolding story, and a celebration made brighter by the people we love.',
  'What began in the ordinary became something we could not imagine living without. Through every season, laughter has been our rhythm and friendship our home. This December, we begin our next chapter surrounded by the family and friends who helped us get here.',
  'Meet us in Lagos',
  true
)
on conflict (id) do update set
  partner_one_name = excluded.partner_one_name,
  partner_two_name = excluded.partner_two_name,
  wedding_date = excluded.wedding_date,
  timezone = excluded.timezone,
  ceremony_time = excluded.ceremony_time,
  reception_time = excluded.reception_time,
  venue_name = excluded.venue_name,
  venue_address = excluded.venue_address,
  dress_code = excluded.dress_code,
  directions_url = excluded.directions_url,
  hero_eyebrow = excluded.hero_eyebrow,
  hero_message = excluded.hero_message,
  story_heading = excluded.story_heading,
  story_introduction = excluded.story_introduction,
  story_body = excluded.story_body,
  details_heading = excluded.details_heading,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.schedule_items (time_label, title, description, sort_order)
values
  ('2:00 PM', 'Ceremony', 'The vows, the rings, and the beginning of forever.', 10),
  ('3:30 PM', 'Portraits & cocktails', 'Raise a glass while we capture a few memories.', 20),
  ('4:30 PM', 'Reception', 'Dinner, toasts, and a room full of our favourite people.', 30),
  ('6:00 PM', 'Dinner', 'Come hungry and save room for something sweet.', 40),
  ('7:30 PM', 'Dancing', 'Comfortable shoes encouraged. Joy required.', 50);
