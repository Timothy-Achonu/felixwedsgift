# Felix & Gift Wedding Website

The Next.js foundation for Felix and Gift's wedding website. Product requirements and phased delivery guidance live in [docs/PRD.md](docs/PRD.md), with palette roles and accessibility guidance in [docs/PALETTE.md](docs/PALETTE.md).

## Current Phase

This repository currently contains the application foundation only: framework configuration, design tokens, environment contracts, quality checks, CI, and a minimal public root page.

Supabase, Cloudinary, administrator routes, guest uploads, the gallery, and other product features are intentionally deferred to their PRD phases.

## Stack

- Next.js 16.3.4 with the App Router and Turbopack
- React 19.2.8
- TypeScript in strict mode
- Tailwind CSS 4
- ESLint and Prettier
- Vitest and Testing Library
- npm on Node.js 24 LTS

Supabase is the planned database and administrator-authentication platform. Cloudinary is the planned photograph storage and delivery platform. Their SDKs will be installed when those integrations are implemented.

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

The Supabase names use the current publishable and secret key model. `SUPABASE_SECRET_KEY`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are server-only values and must never be imported into browser code.

## Architecture Boundaries

- Server Components are the default. Client Components should be introduced only for browser interaction.
- The public site is unlisted and emits `noindex` metadata by default.
- `/admin` will not exist until authentication and server-side authorization are implemented together.
- Cloudinary and Supabase form a distributed workflow. Upload and deletion phases must include idempotency, compensating cleanup, and reconciliation rather than assuming cross-provider transactions.
- The supplied palette reference was validated against the PRD and intentionally not retained as an application asset. The existing `--wedding-*` tokens are the canonical color primitives.
