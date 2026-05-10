# Zè Youth City Hall — Official Platform

> Institutional web platform built for the local branch of the **Association Mairie des Jeunes du Bénin (AMJB)**
> Mandate 2025–2030 · Zè, Atlantique Department, Benin

[![Live — temporary link](https://img.shields.io/badge/Live-Temporary%20link%20(domain%20name%20will%20be%20bought%20soon)-orange?style=flat-square)](https://ze-municipal-webdev-plqu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-n°2021%2F029%2FPDO%2FSG%2FSAG%2FSA-lightgrey?style=flat-square)](/)

---

## Overview

Fullstack institutional platform covering:

- **News** — article publishing with photos
- **Annual Work Plan (AWP)** — real-time activity tracking with PDF export
- **Opportunities** — job and training listings with online applications
- **Admin space** — secured dashboard with two-factor authentication (OTP)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, Server Actions, routing |
| Language | TypeScript | Type-safety, compile-time checks |
| Database | PostgreSQL (Supabase) | Reliable cloud hosting |
| ORM | Prisma 5 | SQL injection protection, migrations |
| Auth | Auth.js v5 | JWT sessions, CSRF protection |
| Storage | Supabase Storage | Photos, PDFs, CVs |
| Emails | Resend | Transactional OTP delivery |
| Rate Limiting | Upstash Redis | Brute-force protection |
| Validation | Zod | Client and server-side schemas |
| Text Editor | Tiptap | Rich text for articles |
| Deployment | Vercel | CI/CD, global Edge Network |
| Styling | Tailwind CSS | Utility-first, responsive design |

---

## Security Architecture

This project applies a **Secure by Design** approach at every layer.

### Authentication (Auth.js v5 + OTP)

- Randomly generated 6-digit OTP, sent by email, valid for 10 minutes, immediately invalidated after use
- Constant-time comparison to prevent timing attacks
- JWT sessions with automatic expiry after 10 hours of inactivity
- Audit logs: every login attempt recorded with timestamp and email

### Route Protection

- Admin entry point is accessible only via a secret URL (token) — not linked anywhere on the public site
- Direct access to `/admin/*` or `/login` returns a 404

### Data Validation (Zod)

- Double validation: client-side (React) **and** server-side (API Route)
- Beninese phone number format: `/^01[0-9]{8}$/`
- Rejection of names containing digits or special characters
- Message length limit (max 1,000 characters)

### Protection Against Common Attacks

| Attack Vector | Mitigation |
|---|---|
| SQL Injection | Prisma ORM with parameterized queries — no raw SQL |
| XSS | Automatic escaping by React + Zod validation |
| CSRF | Auth.js handles CSRF tokens natively |
| OTP Brute Force | Rate limiting via Upstash Redis (5 attempts / 15 min) |
| Application Spam | Rate limiting (10 submissions / hour per IP) |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME Sniffing | `X-Content-Type-Options: nosniff` header |
| Email Enumeration | Constant delay (300ms) regardless of account existence |
| Secrets Exposure | Environment variables, `.env` excluded from versioning |

### HTTP Security Headers

Configured in `next.config.ts`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Data Model

```
User           # Admin accounts (ADMIN / SUPERADMIN)
Article        # News published on the public site
ArticlePhoto   # Photos linked to articles (cascade delete)
Opportunity    # Job listings and training offers
Application    # Applications submitted by visitors
PtaActivity    # Annual Work Plan activities
PtaDocument    # Official AWP PDF document
AuditLog       # Authentication security log
```

---

## Project Structure

```
ze_municipal_webdev/
├── app/
│   ├── (public)/          # Public pages (home, articles, AWP, opportunities)
│   ├── admin/             # Admin dashboard (protected routes)
│   ├── api/               # REST API Routes
│   │   ├── articles/
│   │   ├── candidatures/
│   │   ├── opportunites/
│   │   ├── otp/           # Secure OTP endpoint
│   │   ├── pta/
│   │   └── pta-document/
│   ├── login/             # Login page
│   └── portail/[token]/   # Admin entry point (token-gated, env-based)
├── components/            # Reusable UI components
├── lib/                   # Prisma and Supabase clients
├── prisma/                # Database schema
├── proxy.ts               # Route protection (Next.js 16)
└── auth.ts                # Auth.js configuration
```

---

## Local Setup

**Prerequisites:** Node.js 18+, Supabase account, Resend account, Upstash account

```bash
# 1. Clone the repo
git clone https://github.com/MAWOUGNON/ze-municipal-webdev.git
cd ze-municipal-webdev

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the values in .env

# 4. Sync the database
npx prisma db push

# 5. Generate the Prisma client
npx prisma generate

# 6. Start the development server
npm run dev
```

### Required Environment Variables

See `.env.example` for the full list. Critical variables:

```env
DATABASE_URL                 # Supabase PostgreSQL connection URL
AUTH_SECRET                  # Auth.js secret (generate: openssl rand -base64 32)
RESEND_API_KEY               # Resend API key for OTP delivery
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_SITE_URL
ADMIN_SECRET_TOKEN           # Secret admin entry token (never commit this)
```

> All credentials are managed via environment variables and never committed to source control.

---

## Features

### Public Site

- **Home** — introduction, executive board, latest news, real-time AWP, opportunities
- **News** — article list and detail pages with cover photos
- **Annual Work Plan** — activity tracking with progress bar + official PDF download
- **About** — mission, vision, values, and association motto
- **Opportunities** — listings with validated application form
- **Contact** — contact details and message form
- Fully responsive (mobile + desktop)

### Admin Space

- **Dashboard** — real-time statistics + recent login log
- **Articles** — create, edit, publish/unpublish, delete
- **AWP** — activity management + official PDF upload
- **Opportunities** — listing management
- **Applications** — browsing with filters
- **Uploads** — photos and documents via Supabase Storage

---

## Authentication Flow

```
1. Admin enters their email
2. Server checks account existence (constant delay — anti-enumeration)
3. 6-digit OTP generated, stored (hashed), expires in 10 minutes
4. OTP sent by email via Resend
5. Admin enters the code
6. Server verifies (constant-time), checks expiry, invalidates OTP
7. JWT session created (10h inactivity expiry)
8. All /admin/* routes protected by proxy.ts
```

---

## Audit & Traceability

Every login is recorded in the `AuditLog` table:

```typescript
{
  action: "LOGIN_OTP_SUCCESS" | "LOGIN_FAILED",
  userEmail: string,
  ipAddress?: string,
  createdAt: DateTime
}
```

The admin dashboard displays the 5 most recent logins in real time.

---

## Deployment

Continuously deployed on **Vercel**:

- Every push to `master` triggers an automatic deployment
- Environment variables managed via the Vercel dashboard
- SSL/TLS certificate handled automatically

---

*Developed for the Association Mairie des Jeunes du Bénin — License n°2021/029/PDO/SG/SAG/SA*
