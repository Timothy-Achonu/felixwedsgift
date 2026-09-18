# Image quality, caching, and cost policy

## Current page images

Admin page-image uploads preserve the selected JPEG, PNG, or WebP file. There is
no canvas export, incoming resize, or incoming quality transformation in the
application. Keep Cloudinary upload defaults free of destructive incoming
transformations. The editor supports files up to 10,000,000 bytes and dimensions
up to 8192 pixels per side; provider metadata is checked before saving.

Hero composition remains reversible through focal coordinates and responsive
`object-fit: cover`. Desktop needs at least 1600 x 900 source pixels (3840 x 2160
recommended); phone needs 900 x 1600 (1440 x 2560 recommended). Both source axes
must meet the minimum, regardless of aspect ratio. Framing varies with viewport
shape, as the editor explains. Each slot retains its own asset lifecycle.

Older hero uploads were permanently resized and compressed. They remain usable,
but changing delivery quality cannot recover discarded detail. Re-upload the
original source to improve them. Replacing an admin image removes the unused old
asset; this is separate from the guest-original retention policy below.

Next.js/Vercel produces WebP delivery variants (source-format fallback), at
quality 85 for heroes and 75 elsewhere. Allowed widths are 320, 640, 960, 1440,
1920, 2880, and 3840 pixels. Hero `sizes` accounts for the source width needed to
cover a 92svh-tall frame. Its desktop and phone sources use their own framing.

## Two independent caches

The anonymous, server-only Supabase client caches reads of published settings,
schedule items, and page images for one hour using the `wedding-content` tag.
It does not forward admin cookies or cache authenticated reads, authorization,
Cloudinary verification, or mutations. RLS remains in force. Unpublished content
returns 404 rather than a rendering failure that could retain an old ISR page.

Image-save route handlers expire the tag immediately with
`revalidateTag(tag, { expire: 0 })`. Settings and schedule server actions use
`updateTag(tag)`. Both public routes (`/` and `/gallery`, including metadata) are
revalidated. Reordering invalidates after each successful write, even if its
other write fails. Already-open visitor tabs are not pushed live updates.

The Vercel image cache stores **image bytes**, with a 31-day minimum TTL (a longer
upstream cache lifetime may take precedence). Cached delivery avoids another
Cloudinary download. A new size, format, cache miss, or expiration can require
another source fetch; do not budget as if each original is fetched only once.
Every replacement has a new Cloudinary public ID and URL. Metadata-only edits
keep the URL. Data tags do not purge optimized image bytes. No custom fetch proxy
or second Cloudinary delivery compression step is introduced.

## Guest photographs

The guest uploader supports up to 500 retained photos and is designed for fewer
than 5,000 total site visits in the busiest 30 days. Exact originals remain until
an administrator explicitly removes them; the application does not automatically
delete completed memories.

- Allow fifty files per batch, each at most 10 MB, in JPEG, PNG, or WebP. Apply type,
  byte, and dimension checks before uploading and verify provider metadata before
  publishing. Enforce upload authorization, provider restrictions, and server-side
  rate/volume limits; a browser file-size check alone is not abuse protection.
- Keep new photos pending until moderation. Record original dimensions, format,
  bytes, provider ID, and URL. Keep original downloads explicit and admin-only.
- Use Vercel delivery with thumbnail widths 320/640/960 and lightbox widths
  1440/1920, quality 75. Cap each component's advertised variants accordingly;
  lazy-load and paginate the gallery. Never load original files into the grid.
- Approval, rejection, deletion, and caption changes invalidate the public
  gallery tag after a committed change. Pending and rejected originals use
  Cloudinary authenticated delivery. Approval changes the exact original to
  public delivery; rejection or deletion changes or destroys it with Cloudinary
  CDN invalidation. The gallery immediately removes its database reference, but
  Vercel does not expose a source-image purge API: a previously optimized copy
  can remain at an already-known Vercel image URL until its cache TTL expires.
  This is the explicit privacy/cost tradeoff accepted for the single-original
  design; use separate public derivatives if immediate revocation becomes a hard
  requirement.
- Upload reservations are idempotent. Failed finalization removes the provider
  asset, and later reservation requests opportunistically remove expired,
  abandoned authenticated uploads in bounded batches.

## Budget and monitoring

Cloudinary Free currently includes 25 shared credits: storage GB + transformation
count / 1000 + billable bandwidth credits. Storage includes originals, derivatives,
and provider backups. Storage is a current total; transformations and bandwidth
use a rolling 30-day window. Image bandwidth normally costs one credit per GB,
but some CDN-in-front arrangements use one credit per 0.5 GB. Confirm the actual
account accounting before relying on estimates.

500 originals averaging 5 MB occupy about 2.5 GB. At the 10 MB maximum, they occupy
5 GB. One full original download adds the same amount of delivery bandwidth.
Cold optimizer fetches, cache expiration, admin previews, other projects, and
backups must also fit the shared allowance. A cache cannot reduce original storage.

Vercel Hobby currently includes 5,000 transformations, 300,000 image cache-read
units, and 100,000 image cache-write units per month. Units measure 8 KB chunks,
not photographs or visits. A 200 KB derivative consumes about 25 write units.
Five requested variants for 500 photos mean approximately 2,500 transformations
before retries, revalidations, fallback formats, and other assets; measure actual
bytes to estimate cache units. Check data transfer and requests separately.

Review both provider dashboards at 70% usage and take action by 80% (17.5 and 20
Cloudinary credits). Enable available provider notifications; these are operational
thresholds, not application-enforced caps. Review unused assets and variant sizes,
limit future upload admission if needed, and decide explicitly on a plan upgrade
or manual archive. Do not silently sacrifice original quality. Staying free is a
measured target, not a guarantee.

## Release verification

1. Run `npm run check` and `npm run build`.
2. On a Vercel preview, upload a sharp source and compare its stored original,
   saved admin preview, and delivered hero at phone/desktop sizes and high DPR.
   Compare source/upload dimensions and bytes; inspect the visible crop and
   desktop/phone focal positions. Verify rejected files and failed-save cleanup.
3. Inspect the selected `currentSrc`, response content type, transfer size, and
   image cache headers. Repeat the exact URL with browser caching disabled to
   distinguish a Vercel hit from a browser hit. Test a fresh browser as well.
4. Warm both public routes and metadata, then save an image, focal position,
   description, settings, schedule changes, and publish/unpublish. The next fresh
   request must reflect each save; unpublishing must return 404. Test unauthorized,
   failed, and conflicting writes. Do not mutate live wedding content for testing.
5. Record provider usage and cache headers before/after rollout. Replacing a photo
   must change its URL; ordinary visits and framing edits must not. Local dev
   cache behavior cannot establish production Cloudinary bandwidth savings.

### Local implementation verification (September 2026)

The production build rendered both public pages with one-hour revalidation.
Against the current Cloudinary hero, a 640-pixel, quality-85 WebP request returned
24,522 bytes and changed from `MISS` to `HIT` on repeat, with an unchanged ETag
and `max-age=2678400`. A 1920-pixel request returned 156,672 bytes. Both `/` and
`/gallery` returned 200 with page cache hits. These are measurements of the old
uploaded hero on a local production server, not proof of source quality or Vercel
quota savings. Re-upload and deployed browser/provider checks remain part of
release verification. No live wedding records were changed by these checks.

References (checked September 2026):

- [Cloudinary billing](https://cloudinary.com/documentation/billing_and_plans)
- [Cloudinary plan limits](https://cloudinary.com/pricing/compare-plans)
- [Vercel image limits and pricing](https://vercel.com/docs/image-optimization/limits-and-pricing)
- [Vercel cost management](https://vercel.com/docs/image-optimization/managing-image-optimization-costs)
