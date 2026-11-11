# Maymanah

**The Quran Without Borders.**

Maymanah is a non-profit platform that connects volunteer Quran teachers with
students worldwide, so that anyone with an internet connection can get
structured one-on-one instruction in Hifdh and Tajweed regardless of where they
live or what they can afford.

---

## The problem

Learning Quran properly requires a qualified teacher. That is hard to get:

- **Distance and cost.** In most places there is no local teacher available at
  an accessible price, so students are left with unverified material online or no
  instruction at all.
- **No structure.** Self-study is difficult to sustain. There is no curriculum,
  no accountability, and no way to tell whether progress is real.
- **Teachers carry the admin.** Volunteer teachers who are willing to teach end
  up spending their time on scheduling, payments and progress tracking instead
  of actually teaching.

Maymanah exists to close that gap: a vetted teacher, a structured curriculum,
and scheduling and payments handled by the platform.

## Who it is for

- **Students** — anywhere in the world, any financial background. The goal is
  that Quranic education is free to access.
- **Volunteer teachers (Ustadh)** — qualified teachers who want students without
  having to run their own admin.
- **Supporting donors** — funding the platform so students pay nothing.
- **Administrators** — reviewing teachers, managing courses, and keeping the
  platform healthy.

---

## Current status

**Active development.** The public site and the core student, teacher and admin
flows are implemented against a real database, but the platform is **not
production-complete**. Some features are deliberately partial or placeholders,
and deployment hardening is still outstanding.

| Area | Status | Notes |
| --- | --- | --- |
| Public marketing site | Implemented, still being refined | Home, about, curriculum, teach, contact, donate, privacy and terms |
| Authentication and account security | Implemented, hardening ongoing | Registration, sign-in, email verification, password reset, optional two-factor authentication, session/device management |
| Student portal | Implemented, still expanding | Dashboard, courses, lessons, assessments, certificates, Mushaf reader, messages, sessions and reports |
| Teacher portal | Implemented, still expanding | Dashboard, students, availability, session plans, notes, rescheduling and pairing |
| Admin portal | Implemented, still expanding | Teachers, users, courses, lessons, exams, donations, certificates, analytics and audit log |
| Scheduling and live sessions | Implemented with external dependency | LiveKit credentials are required for video |
| Donations | Partial | M-Pesa is wired up; card and PayPal are still marked coming soon |
| Revision / AI tutor | Placeholder | The route exists, but the feature is not built |
| Production deployment | Not finalised | Hosting, backups, monitoring and operational runbooks still need work |

This is not a finished product. Treat the status table as a map of what exists
in the codebase, not as a release checklist that has been signed off.

## Tech stack

- **Next.js 16.2.4** — App Router, server components, server actions and route handlers
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS v4** — design tokens defined as CSS variables
- **Prisma 7** with the Neon serverless adapter
- **NextAuth / Auth.js 5** — JWT sessions and credentials
- **Neon PostgreSQL**
- **LiveKit** — one-to-one video sessions
- **Vercel Blob** — course images and certificate uploads
- **Nodemailer** — transactional email
- **M-Pesa Daraja** — donation payments
- **Quran Foundation Content API** — Mushaf pages, translations and audio
- **Vitest** and **Playwright** — unit and end-to-end tests
- **Font Awesome** and **Lucide** — iconography
- **pnpm** — package manager

## Getting started

Requires Node.js **20.19 or newer**, pnpm, and a PostgreSQL database. Neon is
the expected provider, but any PostgreSQL database supported by Prisma should
work.

```bash
git clone https://github.com/theeBajber/Maymanah.git
cd Maymanah
pnpm install
cp .env.example .env
pnpm exec prisma migrate deploy
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

`pnpm install` runs `prisma generate` automatically. The seed script is optional
but useful for local catalogue data.

### Environment variables

`.env.example` is the starting point, but some features validate their own
credentials when first used, so not every integration variable is listed there.

The application cannot start without:

```bash
DATABASE_URL=       # pooled Neon connection used at runtime
DIRECT_URL=         # direct Neon connection used by Prisma migrations
AUTH_SECRET=        # at least 32 characters; generate with `openssl rand -base64 32`
APP_URL=http://localhost:3000
```

Optional integration variables include:

- `SMTP_*` — transactional email. Without them, mail is written to the server log.
- `LIVEKIT_*` — live video sessions.
- `BLOB_READ_WRITE_TOKEN` — course image and certificate uploads.
- `QF_*` — Quran Foundation catalog, pages, translations and audio.
- `MPESA_*` — M-Pesa donations and callbacks.
- `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` — AI-assisted book import.
- `CRON_SECRET` — protects the hourly job endpoint (`/api/cron/hourly`).
- `STANDING_*` — attendance ladder thresholds. Defaults are a warning at two missed sessions, paused bookings at three, and a proposed disable at five, counted over 30 days. `STANDING_SHADOW_MODE` defaults to `true`, which records decisions without applying them.
- `TEST_MODE=true` — relaxes rate limits and diverts mail for the end-to-end suite.

### Database

The schema lives in `prisma/schema.prisma`, with migrations under
`prisma/migrations/`.

```bash
pnpm exec prisma migrate dev       # create and apply a migration during development
pnpm exec prisma migrate deploy    # apply existing migrations
pnpm db:seed                       # seed the course catalogue
pnpm exec prisma studio            # inspect data
```

### Available scripts

```bash
pnpm dev          # start the development server
pnpm build        # create a production build
pnpm start        # run the production build
pnpm lint         # run ESLint
pnpm test         # run Vitest unit tests once
pnpm test:watch   # run Vitest in watch mode
pnpm test:e2e     # run the Playwright end-to-end suite
pnpm test:e2e:ui  # run Playwright with its UI
pnpm db:seed      # seed courses
pnpm mpesa:test   # run the M-Pesa STK diagnostic script
```

TypeScript can be checked with `pnpm exec tsc --noEmit`.

---

## What is implemented

### Public site

- Landing page, about page, curriculum, teach, contact and legal pages
- Donation page with M-Pesa STK push and payment-status polling
- Responsive navigation, footer, and automatic light/dark theming
- SEO metadata, sitemap, robots rules, Open Graph and Twitter images
- Web app manifest and generated icons

### Authentication and account

- Credentials registration and sign-in
- Email verification and resend flow
- Forgot-password and reset-password flow
- Optional two-factor authentication with one-time codes
- Login session/device listing and revocation
- Profile, avatar, gender, timezone and preference settings
- Password change and account deletion
- Role-aware routing for students, teachers and admins
- Rate limiting and audit logging for sensitive operations

### Student experience

- Student dashboard with upcoming sessions, leaderboard and empty states
- Course catalogue and course detail pages
- Enrolment, lesson reading, lesson progress and course progress
- Lesson quizzes and final exams
- Course reviews
- Certificates and public certificate verification
- Bookmarks and notifications
- Messages with teachers
- Session list, session detail, notes and plans
- Availability and rescheduling flows
- Report submission
- Mushaf reader with Quran Foundation pages, translations, audio, bookmarks,
  reader settings and locally persisted reading position
- Revision route currently exists as a placeholder

### Teacher experience

- Teacher dashboard
- Student list and student detail pages
- Availability management
- Pairing with students
- Session plans, notes and rescheduling
- Teacher notes for students
- Settings for teaching preferences

### Admin experience

- Admin dashboard and analytics
- Teacher approval, rejection and detail review
- User search, detail view and role management
- Course, lesson, quiz and exam management
- Lesson reordering and AI-assisted book import
- Course image uploads
- Donations ledger with status/provider filters, search and pagination
- Certificate management
- Audit log visibility

### Scheduling, messaging and video

- Mentorship pairing and re-pairing
- Recurring availability slots
- Appointment creation, rescheduling and daily session flows
- Session plans and private notes
- LiveKit video rooms
- In-app messaging and notifications
- Hourly housekeeping job: session reminders, missed-session marking, and seat expiry
- Attendance standing: warnings, paused bookings, and an admin-confirmed disable queue

### Donations and email

- M-Pesa Daraja STK push, callback handling and status polling
- Admin donation ledger and currency-aware analytics
- Transactional email through SMTP, with console fallback when SMTP is unset
- Contact form delivery

## In progress or not finished

- **Card and PayPal donations.** The UI marks them as coming soon. A Stripe
  route exists, but the checkout path is not currently exposed as a working
  option.
- **Revision and AI tutoring.** The revision page is a placeholder.
- **Some Mushaf tools.** Verse notes and a few reader actions still show
  “coming soon”.
- **Reader sync.** Mushaf reading position and reader preferences are stored in
  browser localStorage, not synchronised across devices.
- **Dashboard reporting.** Several dashboard and analytics areas are still
  first-pass and rely on empty states or limited data.
- **Production operations.** Backups, monitoring, alerting, load testing and a
  deployment runbook are not yet in place.
- **CI.** There is no committed CI workflow that runs lint, type checks and the
  test suites on every change.
- **Broader browser coverage.** The end-to-end suite currently runs in desktop
  Firefox only.

## Testing

The repository has both unit and end-to-end coverage:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm test:e2e
```

The Vitest suite currently contains 287 tests across authentication, payments,
scheduling, Quran reader utilities, validation and other library modules.

The Playwright suite covers student, teacher, admin, notes, pairing and
assessment journeys. It uses `TEST_MODE=true` and writes test users/courses to
the configured database, so **run it against a disposable test database**, not
production.

## Roadmap

- Finish and expose card/PayPal donation checkout
- Build the revision and AI tutoring experience
- Complete the remaining Mushaf tools and server-side reading sync
- Harden dashboards and analytics with real operational data
- Add CI for lint, type checks and test suites
- Add mobile and cross-browser end-to-end coverage
- Finalise production hosting, backups, monitoring and deployment documentation

## Known limitations

- Several integrations require credentials that are not included in the
  repository; features fail gracefully or report that they are not connected.
- M-Pesa callbacks require a publicly reachable HTTPS URL.
- Video sessions require a LiveKit project and credentials.
- Uploads require a Vercel Blob token.
- Local development without SMTP logs email instead of sending it.
- The platform has not been load-tested or operated at production scale.
- No part of this repository should be treated as a completed, production-ready
  release.

## AI use

AI coding assistants were used during development of this project.

- **Tools:** AI coding agents used as pair-programming assistants for writing
  and refactoring code, scaffolding components, and resolving build and
  dependency errors.
- **Scope:** primarily boilerplate, component scaffolding, and debugging.
- **Human involvement:** all design decisions, project structure, code review
  and acceptance of every change were made by the developer, who reviewed and
  is accountable for all code in this repository.

## Contributing

Issues and pull requests are welcome. Before opening a pull request, run the
lint, type-check and unit-test commands above.

## License

To be decided.
