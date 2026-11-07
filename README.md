# Zè Youth City Hall platform

Website and admin area of the Mairie des Jeunes de Zè, a branch of the Association Mairie des Jeunes du Bénin (AMJB), mandate 2025-2030. I built it as a volunteer and it runs in production.

Live: https://ze-municipal-webdev-plqu.vercel.app (temporary domain)

The interface is in French because its users are in Benin. The code and this documentation are in English.

## What it does

- Publishes news articles, each with a cover and up to 9 more photos.
- Publishes official documents, with the annual work plan in the featured place.
- Lists job and training offers and takes applications online, with PDF documents attached.
- Gives the team an admin area. An `ADMIN` handles content and applications. A `SUPERADMIN` also manages accounts and reads the activity log.

## Stack

Next.js 16 (App Router), TypeScript, PostgreSQL and Storage on Supabase, Prisma 5, Auth.js v5, Resend, Zod, Tailwind CSS 4. Hosted on Vercel, with data in Ireland. Vitest for unit tests, Playwright and axe for browser tests.

## Security

- Sign in by email code only, with no password. Codes are random, hashed with bcrypt, valid for 10 minutes and limited to 5 attempts, counted atomically.
- A code request gets the same answer whether or not the address has an account.
- Sessions are checked against the database on every request, so a removed account loses access at once.
- Every API route and admin page checks the session on the server. `src/proxy.ts` only hides the admin pages.
- Admin changes go to an activity log in the same transaction as the change.
- Applicants' documents stay in a private bucket under random names. Uploads use one-time links, with limits per IP address and per hour. Admins read them through links valid for one minute, and each reading is logged.
- A daily job deletes applications after 6 months, log lines after a year, and files without an application.
- Row Level Security is on for every table, with no policy, and the Supabase API roles have no rights. Storage has no policy either. These rules live in migrations and `npm run db:check-security` verifies them.
- Pages use a Content Security Policy with a nonce per request. Article HTML goes through an allowlist. Public pages set no cookie.

## Known limits

- An email code is one factor. Passkeys would be stronger.
- The secret login address hides the page. It protects nothing by itself.
- The Content Security Policy allows inline styles. It does not allow inline scripts.
- Uploaded PDFs are checked by type and size, not scanned for malware. Admins should open them with care.
- Upload limits are per IP address and overall. Someone rotating addresses can reach the overall limit and block uploads for an hour.
- Backups depend on the Supabase plan, and the free plan has none.
- The browser tests run by hand, not in CI, because they need a running server.

## Project layout

```text
src/app         pages and API routes
src/components  interface
src/lib         rules, validation and access to data
prisma          database schema and migrations
scripts         administration commands
e2e             browser tests
```

Unit tests sit beside the code they check.

## Run it locally

You need Node.js 24, a Supabase project and a Resend account.

```bash
git clone https://github.com/MAWOUGNON/ze-municipal-platform.git
cd ze-municipal-platform
npm install
cp .env.example .env
```

Fill in `.env`, then:

```bash
npm run db:migrate
npm run db:create-admin -- you@example.com "Your Name"
npm run dev
```

The login page is at `/portail/<ADMIN_SECRET_TOKEN>`.

## Tests

```bash
npm run lint
npm run typecheck
npm test
```

Browser tests run against a server that is already started. The public ones only read, so they can target any deployment:

```bash
E2E_BASE_URL=https://example.com npm run test:e2e
```

The admin test writes to the database and to storage. It only runs with `E2E_ALLOW_WRITES=staging`, using the variables of the preproduction environment:

```bash
E2E_ALLOW_WRITES=staging node --env-file=.env.staging node_modules/@playwright/test/cli.js test
```

## Deployment

Vercel deploys `master`. Migrations are applied by hand with `npm run db:migrate`, which uses `DIRECT_URL`. `.env.example` lists every variable, and the daily purge in `vercel.json` needs `CRON_SECRET`.

## License

The code is under the [MIT license](LICENSE). The photos and logos in `public/` belong to their owners and are not covered by it.
