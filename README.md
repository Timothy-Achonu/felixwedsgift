# Felix & Gift Wedding Website

The Next.js foundation for Felix and Gift's wedding website. Product requirements and phased delivery guidance live in [docs/PRD.md](docs/PRD.md), with palette roles and accessibility guidance in [docs/PALETTE.md](docs/PALETTE.md).

## Current Phase

The public invitation, guest uploads, moderated gallery, and admin workspace are in place. Supabase powers authentication and content records; Cloudinary stores page images and guest-photo originals. Guest photographs remain private until an administrator approves them.

## Stack

- Next.js 16.3.4 with the App Router and Turbopack
- React 19.2.8
- TypeScript in strict mode
- Tailwind CSS 4
- ESLint and Prettier
- Vitest and Testing Library
- npm on Node.js 24 LTS

Supabase is the database and administrator-authentication platform. Cloudinary stores and delivers admin-managed page images and guest photographs through signed upload and management APIs.

## Local Development

Requirements:

- Node.js 24.x
- npm 11.x

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command                | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the local development server      |
| `npm run build`        | Create a production build               |
| `npm run start`        | Serve the production build              |
| `npm run lint`         | Run ESLint                              |
| `npm run lint:fix`     | Apply safe ESLint fixes                 |
| `npm run typecheck`    | Check TypeScript without emitting files |
| `npm run format`       | Format supported files with Prettier    |
| `npm run format:check` | Verify formatting                       |
| `npm run test`         | Run the Vitest suite once               |
| `npm run test:watch`   | Run Vitest in watch mode                |
| `npm run check`        | Run all non-build quality checks        |

## Environment

Copy `.env.example` to `.env.local` when an integration phase needs credentials. All entries are optional during the foundation phase, but values are validated when present.

The Supabase names use the current publishable and secret key model. `SUPABASE_SECRET_KEY`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `UPLOAD_RATE_LIMIT_SECRET` are server-only values and must never be imported into browser code.

## Admin Page Images

The `/admin/page-images` editor controls desktop and phone hero framing, both story photographs, and the venue photograph. Save the desktop hero first; its image description is shared by both hero compositions. It does not edit the guest gallery. Admin uploads preserve the original file and go directly to Cloudinary using a server-authorized signed request; asset references, focal positions, and alt text are saved in Supabase. Uploads accept JPEG, PNG, or WebP up to 10 MB and 8192 pixels per side.

Public content uses tagged server-side caching, invalidated after admin changes. Next.js/Vercel separately caches optimized image delivery for at least 31 days; replacement uploads use new URLs. Existing compressed hero uploads need re-uploading from the original to recover quality. See [image quality, caching, and cost policy](docs/IMAGE-QUALITY-AND-COSTS.md) for validation, guest-photo requirements, budget assumptions, and production verification.

Apply `supabase/migrations/20260915000100_create_page_images.sql` to the wedding Supabase project. To enable uploads, set these values in `.env.local` and in the deployment environment, then restart or redeploy:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: the Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: the Cloudinary API key, server-only.
- `CLOUDINARY_API_SECRET`: the Cloudinary API secret, server-only.

No browser localStorage entries or unsigned upload preset are required. The current stock photographs remain as labeled placeholders until admins replace each slot.

## Guest Photographs

Apply `supabase/migrations/20260916000100_create_guest_photos.sql` after the page-image migration. Guest uploads accept batches of up to ten JPEG, PNG, or WebP files, each no larger than 10 MB or 8192 pixels on either side. The browser uploads directly with short-lived signed Cloudinary parameters; the server verifies provider metadata before recording each photo as `PENDING`.

Set `UPLOAD_RATE_LIMIT_SECRET` to a random value of at least 32 characters. It hashes the anonymous device cookie and deployment-provided IP address used for the 30-per-device and 200-per-IP hourly limits. `SUPABASE_SECRET_KEY` is also required for reservation and completion routes. The feature fails closed when either value is absent.

Administrators review photos at `/admin/photos`, can edit captions, approve or reject individually or in bulk, download originals, and permanently delete individual photos. Only `APPROVED` rows pass public RLS and appear in the paginated gallery. Pending and rejected Cloudinary assets use authenticated delivery; approval intentionally makes the exact original public so only one source asset is stored.

## Architecture Boundaries

- Server Components are the default. Client Components should be introduced only for browser interaction.
- The public site is unlisted and emits `noindex` metadata by default.
- `/admin` uses Supabase Auth and server-side admin membership checks.
- Cloudinary and Supabase form a distributed workflow. Upload and deletion phases must include idempotency, compensating cleanup, and reconciliation rather than assuming cross-provider transactions.
- The supplied palette reference was validated against the PRD and intentionally not retained as an application asset. The existing `--wedding-*` tokens are the canonical color primitives.
