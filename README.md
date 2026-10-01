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

---

## Current status

This is an early build. **The landing page and design foundation are complete;
the application backend is not yet implemented.**

| Area | Status |
| --- | --- |
| Landing page (hero, principles, donation CTA) | Done |
| Automatic dark/light theme | Done |
| Responsive navigation and footer | Done |
| Authentication (register/login) | Not built — route group scaffolded only |
| Teacher/student portal | Not built — route group scaffolded only |
| Video sessions, courses, exams, payments | Not built |

The route groups `(auth)`, `(home)` and `(portal)` are already in place, so the
structure for those areas is decided and ready to be filled in.

## Tech stack

- **Next.js 16.2.4** — App Router, Turbopack
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS v4** — design tokens defined as CSS variables
- **Font Awesome** and **Lucide** — iconography
- **pnpm** — package manager

## Getting started

Requires Node.js 20 or newer and pnpm.

```bash
git clone https://github.com/theeBajber/Maymanah.git
cd Maymanah
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

**None required at this stage.** The current code is frontend-only, so you can
clone and run it without configuring a database, payment provider or any
external service. A `.env.example` will be added when the backend lands.

### Available scripts

```bash
pnpm dev     # start the dev server
pnpm build   # production build
pnpm start   # run the production build
pnpm lint    # run ESLint
```

---

## Features implemented

- **Landing page** — hero with call-to-action, core principles section, and a
  donation CTA
- **Automatic theme switching** — light and dark palettes driven by
  `prefers-color-scheme`, no toggle or flash on load
- **Design system foundation** — colour, spacing and typography tokens
  centralised in `app/globals.css`
- **Arabic typography** — Amiri, loaded through `next/font`
- **Shared navigation** — desktop bar and mobile drawer
- **Route groups** — `(auth)`, `(home)` and `(portal)` separation ready for
  upcoming features

## Roadmap

- Authentication (Auth.js) with student and teacher roles
- Teacher vetting and approval workflow
- Teacher/student portal with session scheduling
- Live one-on-one video sessions
- Course curriculum, lessons and exams with progress tracking
- Donation and course payments (M-Pesa and card)
- Admin dashboard

## Known limitations

Stated plainly, because they are real:

- **Nav links 404.** Curriculum, About, Register and Donate are linked but the
  pages do not exist yet. Only the landing page renders.
- **No backend.** There is no database, no API and no persistence. All content
  is static and hardcoded in the page components.
- **No authentication or user roles.** The `(auth)` and `(portal)` route groups
  are empty layouts.
- **No tests.** No test runner is configured yet.
- **Donations are not functional.** The Donate button links to a page that does
  not exist. No payment provider is integrated.
- **Theme is automatic only.** There is no manual light/dark toggle, so it
  always follows the operating system setting.
- **Placeholder imagery.** Some stats and teacher portraits in the landing page
  are illustrative, not real user data.

## Screenshots

> To be added once the application is running end to end. Real screenshots of
> the working app will be committed here.

---

## AI use

AI coding assistants were used during development of this project.

- **Tools:** AI coding agents used as pair-programming assistants for writing
  and refactoring code, scaffolding components, and resolving build and
  dependency errors.
- **Scope:** primarily boilerplate, component scaffolding, and debugging.
- **Human involvement:** all design decisions, project structure, code review
  and acceptance of every change were made by the developer, who reviewed and
  is accountable for all code in this repository.

AI use is disclosed here in line with the hackathon's requirements.

## Contributing

This is a hackathon project. Issues and pull requests are welcome.

## License

To be decided.