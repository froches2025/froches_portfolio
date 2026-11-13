# Froches Portfolio v2: Technical design

Nov 12, 2026 · @Favour Michael

How slice 1a (public v2, 15 Nov) and 1b (admin) are built, implementing the approved PRD. Slice 2 parts are sketched where they shape the schema.

## 1. Repository layout and conventions

One Next.js repo (froches2025/froches\_portfolio), rebuilt from scratch on a long-lived v2 branch, with every dependency pinned to an exact version. Starting point: main at b79f85b, the merged hotfix.

### Layout

```
.github/workflows/      ci.yml (every PR), keepalive.yml (schedule)
docs/                   prd.md, technical-design.md, adr/, design/ (screens), design/source/
supabase/               config.toml, migrations/, seed.sql, tests/ (RLS and policy tests)
src/app/(public)/       home, projects, projects/[slug], about, guestbook (slice 2)
src/app/(admin)/admin/  sign-in, dashboard, projects, content, resume, inbox (slice 2)
src/app/api/            auth callback, resume redirect, revalidate hooks
src/components/ui/      shadcn/ui primitives
src/components/motion/  motion presets that honour reduce-motion and low-power mode
src/components/public/  site sections (hero, project card, slideshow, timeline)
src/components/admin/   forms, image manager, reorder list
src/lib/supabase/       server.ts, browser.ts, service.ts (server-only)
src/lib/content/        typed queries for public data, cache tags
src/lib/validation/     zod schemas shared by forms and server actions
src/lib/env.ts          validated environment variables
tests/unit/  tests/e2e/ Vitest and Playwright
```

### Branches and commits

- main = production, protected: merge only by squash PR with green CI.
- v2 = integration branch until the 1a launch, protected the same way. Step branches start from v2 until launch, from main after.
- Branch names: feat/, fix/, chore/, docs/, test/ plus a short slug, for example feat/case-study-slideshow.
- Conventional Commits with FR numbers, for example `feat(projects): add case study slideshow (FR-2.4)`. Checked by commitlint in a git hook and in CI.
- One step = one branch = one PR. Docs change in the same PR as the code.

### Code standards

- TypeScript strict mode, no `any` without a comment saying why.
- ESLint flat config with eslint-config-next, Prettier with the Tailwind class sorter. `npm run lint`, `typecheck`, `test`, `test:e2e`, `build` must all pass locally before a PR.
- Server-only modules import `server-only` so secrets cannot leak into browser code.
- Exact versions in package.json (no ^ or \~), committed lockfile, `npm ci` in CI.

### Pinned versions (checked on npm, 12 Nov 2026)

| Package | Version | Note |
| --- | --- | --- |
| Node.js | 24.x LTS | Pinned in .nvmrc, package.json engines and Vercel settings. Vercel offers 26.x (default) and 24.x |
| next, eslint-config-next | 16.4.6 | v1 used 16.3.2 |
| react, react-dom | 19.3.1 |  |
| typescript | 6.0.3 | NOT 7.0.2: typescript-eslint 8.72.2 supports TypeScript below 6.1 only |
| tailwindcss, @tailwindcss/postcss | 4.3.5 |  |
| shadcn (CLI), radix-ui | 4.23.0, 1.8.1 |  |
| motion | 14.13.0 | Same library as framer-motion, under its current package name |
| @supabase/supabase-js, @supabase/ssr | 2.119.0, 0.12.7 | supabase-js needs Node 22 or later |
| supabase (CLI) | 3.1.0 | Dev dependency, for migrations and tests |
| zod | 4.6.7 | New: validation |
| embla-carousel-react | 8.6.0 | New: slideshow |
| cmdk | 1.1.1 | Command palette, as in v1 |
| @vercel/analytics | 2.0.1 | New |
| vitest, @vitejs/plugin-react, vite, jsdom | 5.1.0, 6.3.0, 8.3.8, 31.0.0 | New: unit and component tests |
| @testing-library/react, @testing-library/dom | 16.3.3, 10.4.2 | New. dom is a required peer of react (added 13 Nov) |
| @playwright/test, @axe-core/playwright | 1.65.0, 4.14.0 | New: end-to-end and accessibility tests |
| @lhci/cli | 0.16.1 | New: Lighthouse in CI |
| eslint, prettier, prettier-plugin-tailwindcss | 9.39.5, 3.10.1, 0.8.1 | NOT eslint 10: plugins bundled by eslint-config-next 16.4.6 accept ESLint 9 only (ADR 0001, 13 Nov) |
| husky, lint-staged, @commitlint/cli, @commitlint/config-conventional | 9.1.7, 17.6.0, 21.2.4, 21.2.4 | New: git hooks |
| @types/node, @types/react, @types/react-dom | 24.19.2, 19.3.0, 19.3.0 | Type definitions (added 13 Nov) |
| class-variance-authority, clsx, tailwind-merge, tw-animate-css, lucide-react | 0.7.1, 2.1.1, 3.7.0, 1.4.0, 1.72.0 | Used by shadcn/ui, as in v1 (added 13 Nov). shadcn 4.23.0's init offers a new `cn` package instead of clsx and tailwind-merge; not adopted |

Step 2 adds @vitest/coverage-v8 5.1.0 (approved 13 Nov). Slice 1b adds browser-image-compression 2.0.2. Slice 2 adds resend 6.38.0, @marsidev/react-turnstile 1.6.3 and @vercel/speed-insights 2.1.0. Versions are re-checked when each slice starts.

## 2. Data model

Postgres on Supabase with row-level security on every table and a default of deny. Visitors read published content only; Favour's account, checked by `is_admin()`, writes content; visitor submissions are inserted only by server code after the bot check. All times are stored in UTC and shown in Africa/Kigali time (UTC+2) in the admin panel.

### Shared rules

- Every table has RLS enabled. A test lists all tables in the public schema at run time and fails if any has RLS off or lacks a policy (no hard-coded table list).
- `is_admin()`: a SQL function that is true only when the signed-in user's GitHub identity ID equals Favour's numeric GitHub user ID, stored in a private settings table set by migration. The app checks the same ID on the server (ADMIN\_GITHUB\_ID).
- No content table references auth.users, so deleting or recreating the admin account never fails on foreign keys.
- `id uuid default gen_random_uuid()`, `created_at` and `updated_at timestamptz default now()` on every table, with a trigger keeping `updated_at` current. Not repeated below.
- Text limits are enforced twice: zod in the app and CHECK constraints in the database.

### profile (one row, slice 1a)

| Column | Type | Rules |
| --- | --- | --- |
| singleton | boolean | Primary key, always true, so only one row can exist |
| full\_name | text | Required, max 80 |
| headline | text | Required, max 120 |
| location | text | Optional, max 80 |
| bio\_md | text | Required, Markdown, max 4,000 |
| email | text | Required, valid email |
| github\_url, linkedin\_url, x\_url | text | Optional, https only |
| resume\_path | text | Storage path of the current resume PDF |
| resume\_updated\_at | timestamptz | Set when the resume changes |
| headshot\_path | text | Optional storage path |

### projects (slice 1a)

| Column | Type | Rules |
| --- | --- | --- |
| slug | text | Required, unique, lowercase words joined by hyphens |
| title | text | Required, max 80 |
| one\_liner | text | Required, max 160 |
| year | smallint | Required, 2015 to 2100 |
| status | text | live, in\_development or archived |
| live\_url, repo\_url | text | Optional, https only |
| stack | text\[\] | Up to 12 tags, each max 30 |
| problem\_md, role\_md, approach\_md, challenges\_md, outcome\_md | text | Optional Markdown case study sections, each max 4,000. Empty ones are hidden (FR-2.3) |
| is\_published | boolean | Default false |
| published\_at | timestamptz | Set on first publish |
| is\_featured | boolean | Default false |
| sort\_order | integer | Required, unique: the manual order |
| featured\_order | integer | Required when featured, empty otherwise; unique among featured; at most 4 featured projects, enforced by a trigger |

### project\_images (slice 1a)

| Column | Type | Rules |
| --- | --- | --- |
| project\_id | uuid | References projects, deleted with its project |
| storage\_path | text | Required, unique |
| alt | text | Required, 1 to 200 |
| caption | text | Optional, max 200 |
| width, height | integer | Required, for layout without shift |
| sort\_order | integer | Unique per project; the first image is the cover |

Deleting a project: the server action removes the image files from storage first, then the row. Rows cascade.

### experience, education, roles, skills (slice 1a)

| Table | Columns | Rules |
| --- | --- | --- |
| experience | role, organisation, org\_url, location, engagement (for example Contract), start\_month date, end\_month date, bullets text\[\], certificate\_path, sort\_order | end\_month empty means present; up to 8 bullets, each max 300 |
| education | programme, institution, location, period\_label, detail, certificate\_path, sort\_order | period\_label is free text because the resume uses "Completed" and "2029 (expected)" |
| roles | title, organisation, start\_month date, end\_month date, detail, sort\_order | Leadership and community roles |
| skills | group\_name, items text\[\], sort\_order | For example Languages: Python, TypeScript |

### Slice 2 tables (created later, listed so slice 1 leaves room)

| Table | Columns | Rules |
| --- | --- | --- |
| contact\_messages | name, email, message, status | name max 100, message max 5,000; status unread, read or archived |
| guestbook\_entries | message, name, role, country\_code, status, moderated\_at | message 1 to 500 required; name and role max 60; country\_code is a 2-letter ISO code; status pending, approved or rejected |
| event\_counts | event\_type, project\_id, day, count | event\_type resume\_download, contact\_sent, guestbook\_posted or project\_link\_click; one row per type, project and day; incremented by a SQL function |
| rate\_limits | key\_hash, action, window\_start, count | key\_hash is a salted one-way hash of the IP; rows older than 24 hours are purged daily |

### Access rules

| Table | Visitors can read | Admin can | Server code (service key) |
| --- | --- | --- | --- |
| profile, experience, education, roles, skills | All rows | Read, write | Nothing |
| projects | Published rows | Read, write all | Nothing |
| project\_images | Rows of published projects | Read, write all | Nothing |
| contact\_messages | None | Read, update, delete | Insert after bot check |
| guestbook\_entries | Approved rows | Read, update, delete | Insert after bot check |
| event\_counts | None | Read | Increment |
| rate\_limits | None | None | Read, write |

| Storage bucket | Visitors | Admin |
| --- | --- | --- |
| project-images | Read | Upload, replace, delete; images only (JPEG, PNG, WebP), 10 MB |
| documents | Read | Upload, replace, delete; PDF up to 5 MB and the headshot image |

The slice 1a seed fills profile, projects, experience, education, roles and skills from the resume Favour approved on 12 Nov 2026. Nothing that is not in the resume goes into the seed.

## 3. Routes, server actions and endpoints

Public pages are pre-rendered and cached by tag; admin saves refresh only the tags they touch. There is no separate REST API: writes go through Next.js server actions, plus four small route handlers. Every admin action re-checks the session and `is_admin` on the server and validates input with zod before writing.

### Public pages (pre-rendered, no database call per visit)

| Route | Cache tags | FRs | Slice |
| --- | --- | --- | --- |
| / | profile, projects | FR-1.1, 1.2, 1.3, 1.5, 9.1, 10.1 | 1a |
| /projects | projects | FR-2.1 | 1a |
| /projects/\[slug\] | projects, project:\[slug\] | FR-2.3 to 2.6. Unknown or draft slug returns 404; new published slugs render on first request, then stay cached | 1a |
| /about | profile, about | FR-3.1, 3.2 | 1a |
| /privacy | none (static) | NFR-6 | 1a |
| /sitemap.xml, /robots.txt, /opengraph-image | projects | FR-10.1 to 10.3 | 1a |
| /guestbook | guestbook | FR-8.5 | 2 |

### Route handlers

| Route | Does | Auth | FRs | Slice |
| --- | --- | --- | --- | --- |
| GET /resume | Redirects to the current resume file. Reads profile through the cached query, so no database call per visit. Slice 2 adds a download count | Public | FR-4.1, 4.2, 9.2 | 1a |
| GET /auth/callback | Completes GitHub sign-in, then signs out and denies anyone who is not Favour | Public | FR-5.1 | 1b |
| POST /api/events | Counts project link clicks sent with sendBeacon; rate-limited | Public | FR-9.2 | 2 |
| GET /api/cron/keepalive | Runs a tiny query and purges old rate-limit rows. Called by GitHub Actions with a secret bearer token | CRON\_SECRET | NFR-4, NFR-5 | 1a (keep-alive), 2 (purge) |

### Redirects (next.config)

| From | To | Type |
| --- | --- | --- |
| /resume-favour-michael.pdf | /resume | Permanent, keeps the v1 link alive (FR-4.2) |
| Any path on portfolio.froches.tech | Same path on froches.tech | Permanent, set as a Vercel domain redirect (FR-11.2) |

### Admin pages (dynamic, never cached, noindex)

| Route | Purpose | FRs | Slice |
| --- | --- | --- | --- |
| /admin/sign-in | Sign in with GitHub | FR-5.1 | 1b |
| /admin | Dashboard: drafts, featured order, quick links (slice 2 adds counts) | FR-6.3, 9.3 | 1b |
| /admin/projects | List with publish state, reorder | FR-6.1, 6.3 | 1b |
| /admin/projects/new, /admin/projects/\[id\] | Project form, images, publish | FR-6.1, 6.2, 6.4, 6.8 | 1b |
| /admin/projects/\[id\]/preview | Draft shown exactly as the public page would show it | FR-6.1 | 1b |
| /admin/content | Profile, experience, education, roles, skills | FR-6.5 | 1b |
| /admin/resume | Upload a new resume PDF | FR-6.6 | 1b |
| /admin/inbox, /admin/guestbook | Messages and moderation queue | FR-7.4, 8.3 | 2 |

### Server actions

| Action | Writes | Refreshes tags | FRs | Slice |
| --- | --- | --- | --- | --- |
| saveProject, deleteProject | projects (and image files on delete) | projects, project:\[slug\] | FR-6.1 | 1b |
| setPublished | projects.is\_published, published\_at | projects, project:\[slug\] | FR-6.1, 2.5 | 1b |
| reorderProjects, setFeatured, reorderFeatured | sort\_order, is\_featured, featured\_order | projects | FR-6.3, 1.2 | 1b |
| createImageUploadUrl, saveImage, updateImage, deleteImage, reorderImages | project\_images and storage | project:\[slug\] | FR-6.2 | 1b |
| saveProfile, saveExperience, saveEducation, saveRoles, saveSkills | Those tables | profile, about | FR-6.5 | 1b |
| createResumeUploadUrl, saveResume | documents bucket, profile.resume\_path | profile | FR-6.6 | 1b |
| signOut | Session | none | FR-5.3 | 1b |
| submitContact | contact\_messages, emails, event\_counts | none | FR-7.1 to 7.3, 9.2 | 2 |
| submitGuestbookEntry | guestbook\_entries, alert email, event\_counts | none | FR-8.1, 8.2, 8.4 | 2 |
| moderateEntry, updateMessage | guestbook\_entries, contact\_messages | guestbook | FR-8.3, 7.4 | 2 |

Image and resume uploads go straight from the browser to Supabase Storage through a short-lived signed upload URL that the server action creates. This avoids pushing 10 MB files through a Vercel function, which has a much smaller request-body limit.

## 4. Screens and main actions

Five public screens ship in 1a and six admin screens in 1b. Every screen is designed phone-first at 360 px, then desktop. The visual design phase draws each one; this section fixes what each must contain and do.

### Public (slice 1a)

| Screen | Contains | Main actions | Empty, loading and error states |
| --- | --- | --- | --- |
| Home | Name, headline, one-line pitch; up to 4 featured project cards; short About teaser; footer links | View projects, Download resume, Contact (email link until slice 2), open a featured project | No featured projects: the section is hidden |
| Projects | All published projects in manual order: cover, title, one-liner, year, stack tags, status | Open a case study | Zero published: a short note and the resume button |
| Case study | Title, one-liner, status, year, stack, live and repo links, slideshow, the case study sections that have content, previous and next project | Swipe or arrow through images, open live site or repo, go to next project | Missing image: neutral placeholder with the alt text; missing section: hidden |
| About | Bio, experience timeline, education, leadership roles, skills, optional headshot | Download resume, email, social links | No headshot: layout without it |
| 404 | Friendly message, links home and to projects | Navigate back | n/a |

Across all public screens: desktop side navigation that highlights the section in view; compact menu on phones; command palette on Ctrl+K or Cmd+K with go-to-page and download-resume commands; going back restores scroll position (FR-1.4); skip-to-content link; dark and light themes following the device setting (proposed, decided in visual design).

### Admin (slice 1b)

| Screen | Contains | Main actions |
| --- | --- | --- |
| Sign in | GitHub button; denied message for other accounts | Sign in |
| Dashboard | Drafts waiting, featured lineup, last resume update | Jump to a draft, reorder featured |
| Projects list | Every project with draft or published badge and featured star | New project, reorder with up and down buttons (phone) or drag (desktop), toggle featured |
| Project editor | Fields grouped as Basics, Links, Case study sections, Images; sticky Save bar | Save draft, Preview, Publish or Unpublish, upload, reorder and caption images, delete project with a typed confirmation |
| Content | Tabs for Profile, Experience, Education, Roles, Skills | Edit, add, reorder and remove entries |
| Resume | Current file name and date, upload box | Upload a new PDF, open the current one |

Every admin form shows inline validation, a saving state, and a confirmation toast that says when the public page will refresh. Leaving with unsaved changes asks first (FR-6.8).

## 5. Background jobs

There are no long-running workers. Three short flows run in the background, and none of them makes a visitor wait.

&#91;embedded content: Background jobs · 3 flows, 4 steps each\]

- **Publish and refresh:** the server action refreshes only the cache tags it touched. Next.js rebuilds the page on the next visit and keeps serving the old copy until the new one is ready.
- **Keep-alive:** a GitHub Actions schedule calls the keep-alive route once a day at 04:17 UTC (proposed), well inside Supabase's one-week pause window. A failed run emails Favour through GitHub's normal notifications.
- **Visitor message (slice 2):** the message is saved before any email is sent, so a Resend outage or the 100-a-day limit never loses a message. Email failures are logged and shown in the admin inbox.

## 6. Auth, environments and environment variables

There is one production Supabase project and no cloud dev project. Supabase Free allows two active projects across every organisation you own, and LifeTrack already uses one. Local work and CI run Supabase in Docker through the Supabase CLI.

### Environments

| Environment | Runs on | Database | Admin |
| --- | --- | --- | --- |
| Local | Favour's laptop, WSL, Node 24 | Local Supabase in Docker, seeded | On, through a separate dev GitHub OAuth app |
| CI | GitHub Actions | Local Supabase in Docker on the runner, created fresh on every run | Tested with a seeded admin identity |
| Preview | Vercel preview deployment for each PR | Production project, read through RLS (public data only) | Off (ADMIN\_ENABLED=false), so a preview can never write to production |
| Production | main, served at froches.tech | Production project | On |

### Sign-in flow (slice 1b)

1. Favour taps Sign in with GitHub on /admin/sign-in. Supabase Auth runs the GitHub OAuth flow with PKCE.
2. GitHub returns to Supabase, then to /auth/callback, which sets the session cookie through @supabase/ssr.
3. The callback compares the GitHub identity's numeric ID with ADMIN\_GITHUB\_ID. Any other account is signed out at once and shown the denied page.
4. Only /admin and /auth routes run the session-refresh check, so public pages stay static and fast.
5. Every admin page and server action calls one `requireAdmin()` helper; the database repeats the check through `is_admin()`.
6. Inactivity limit (FR-5.3): Supabase's own session time-box and inactivity timeout are Pro-plan features, so the app keeps a signed last-activity cookie and signs Favour out after 7 days without admin use.

### Environment variables

Validated at build and start by `src/lib/env.ts`. A missing or malformed value fails the build. Secrets live only in Vercel, GitHub secrets and a git-ignored .env.local; .env.example lists every name with no values.

| Name | Secret | Used by | Purpose | Slice |
| --- | --- | --- | --- | --- |
| NEXT\_PUBLIC\_SITE\_URL | No | App | Canonical URL: https://froches.tech in production | 1a |
| NEXT\_PUBLIC\_SUPABASE\_URL | No | App | Supabase project URL | 1a |
| NEXT\_PUBLIC\_SUPABASE\_PUBLISHABLE\_KEY | No | App | Public key; RLS limits it to published data | 1a |
| CRON\_SECRET | Yes | Keep-alive route, GitHub Actions | Bearer token for /api/cron/keepalive | 1a |
| ADMIN\_ENABLED | No | App | true in local and production, false in previews | 1b |
| ADMIN\_GITHUB\_ID | No | App, migration | Favour's numeric GitHub user ID | 1b |
| ADMIN\_SESSION\_SECRET | Yes | App | Signs the last-activity cookie | 1b |
| SUPABASE\_SECRET\_KEY | Yes | Server-only code | Inserts visitor submissions and counts after the bot check | 2 |
| RATE\_LIMIT\_SALT | Yes | Server-only code | Salt for the one-way IP hash | 2 |
| RESEND\_API\_KEY | Yes | Server-only code | Sends email | 2 |
| EMAIL\_FROM | No | Server-only code | Sender address on froches.tech (exact address chosen in slice 2) | 2 |
| CONTACT\_TO\_EMAIL | No | Server-only code | f.michael@alustudent.com | 2 |
| NEXT\_PUBLIC\_TURNSTILE\_SITE\_KEY | No | App | Turnstile widget | 2 |
| TURNSTILE\_SECRET\_KEY | Yes | Server-only code | Verifies Turnstile tokens | 2 |

GitHub Actions secrets: KEEPALIVE\_URL and CRON\_SECRET. The GitHub OAuth client ID and secret are stored in Supabase's auth provider settings, never in the repo. Allowed redirect URLs: http://localhost:3000 and https://froches.tech.

## 7. Testing scope and CI pipeline

Every PR to v2 or main must pass five gates: code checks, unit and component tests, database security tests, end-to-end tests with accessibility checks, and Lighthouse budgets. A failing test is explained as either the test being wrong or the code being wrong, with proof, before anything is changed.

### What is tested

| Layer | Tool | Covers | Slice |
| --- | --- | --- | --- |
| Unit | Vitest | zod schemas, slug and ordering helpers, env validation, Kigali date formatting, redirect map, motion-preference logic | 1a |
| Component | Vitest, Testing Library, jsdom | Slideshow (arrow keys, buttons, swipe, alt text), nav section highlight, command palette, hidden empty case-study sections, project card states | 1a |
| Database | Supabase CLI with pgTAP (bundled with the CLI) | RLS on every table found at run time; visitors cannot read drafts or write anything; a signed-in non-admin cannot write; admin can; at most 4 featured; check constraints | 1a, extended in 1b and 2 |
| End-to-end | Playwright, desktop Chromium and a mobile WebKit profile | Home to case study and back keeps scroll position; resume and old resume URL redirect; draft slug gives 404; command palette; full run with reduce-motion on | 1a |
| Accessibility | @axe-core/playwright on every public page | No serious or critical violations | 1a |
| Performance | Lighthouse CI, mobile preset, on /, /projects and one case study | Performance 90+, accessibility, best practices and SEO 100 | 1a |
| Admin journeys | Playwright with a seeded test admin (local and CI only) | Sign-in gate, denied non-admin, create draft, preview, publish, page refreshes, reorder, image alt required, resume upload | 1b |

CI cannot complete a real GitHub OAuth sign-in. Local Supabase therefore seeds a test user with a GitHub identity whose ID matches ADMIN\_GITHUB\_ID in CI. This exists only in local and CI configs, never in production.

Coverage target: 80% of lines in src/lib (proposed). Visual design is checked by people, not by snapshot tests.

### CI pipeline (.github/workflows/ci.yml)

Runs on pull requests to v2 and main and on pushes to them. Each job is named after its check, so branch protection lists these names:

| Job | Needs | Runs |
| --- | --- | --- |
| `lint` |  | ESLint, then Prettier format check |
| `typecheck` |  | `next typegen`, then `tsc --noEmit` |
| `commitlint` |  | Pull requests only: every commit in the PR, then the PR title. The title becomes the commit on v2 and main because PRs are squash-merged. It is passed to commitlint through an environment variable, never inlined in the script, so a crafted title cannot inject shell commands |
| `unit` |  | Vitest unit and component tests (coverage from step 2) |
| `build` |  | `next build`, then uploads `.next/` (without its cache) as an artifact. `include-hidden-files` is set because upload-artifact skips hidden folders by default |
| `e2e` | `build` | Downloads the build into `.next/`, then Playwright with axe on desktop Chromium and mobile WebKit |
| `lighthouse` | `build` | Downloads the build into `.next/`, then Lighthouse CI with the mobile budgets |
| `database` (from step 2) |  | `supabase start`, apply migrations, run the pgTAP tests, load the seed |

1. Every job installs Node from .nvmrc and runs `npm ci` with the npm cache (shared composite action `.github/actions/setup`).
2. `NEXT_PUBLIC_SITE_URL` is set to http://localhost:3000 for the whole workflow; it is not a secret.
3. On failure, the Playwright report and Lighthouse results are uploaded as artifacts.
4. From step 2, the build runs against the local Supabase.

Branch protection on v2 and main requires every job to pass and the branch to be up to date. Vercel builds its own preview for each PR in parallel.

### Keep-alive workflow (.github/workflows/keepalive.yml)

Runs daily at 04:17 UTC (proposed) and on manual trigger. It calls KEEPALIVE\_URL with CRON\_SECRET and fails loudly on anything but HTTP 200.

## 8. Decisions checklist

All sixteen decisions were approved by Favour on 13 Nov 2026. Items marked New add a library or service that v1 did not use.

### Platform and versions

- [x] Node 24 LTS, not Vercel's default 26: 24 has had a year longer for libraries to support it. Vercel offers both ([source](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)).
- [x] TypeScript 6.0.3, not 7.0.2: the linter's TypeScript plugin (typescript-eslint 8.72.2) supports versions below 6.1 only (checked on npm, 12 Nov).
- [x] Use the `motion` package (the current name of Framer Motion, same library and API).
- [x] The repo stays public. It is part of the portfolio, and secrets never enter it.

### New libraries

- [x] New for slice 1a: zod, embla-carousel-react, @vercel/analytics, vitest with @vitejs/plugin-react, jsdom and Testing Library, Playwright with axe, Lighthouse CI, husky, lint-staged, commitlint.
- [x] New for slice 1b: browser-image-compression, which shrinks images in the browser before upload because Supabase image transformations are unavailable on the Free plan ([source](https://supabase.com/docs/guides/platform/org-based-billing)).
- [x] New for slice 2: resend, @marsidev/react-turnstile, @vercel/speed-insights.

### Services and environments

- [x] New service: one production Supabase project. Supabase Free allows two active projects across all your organisations ([source](https://supabase.com/docs/guides/platform/billing-faq)). Favour confirmed a free slot is available.
- [x] No cloud dev database: local work and CI use Supabase in Docker. Favour confirmed Docker works in her WSL.
- [x] Vercel previews read production public data through RLS, and admin is switched off on previews.
- [x] New services in slice 2: a free Cloudflare account (Turnstile) and a free Resend account.
- [x] Favour creates the Supabase project, Vercel variables, GitHub secrets and branch protection herself, following steps in the handoff. Claude Code never changes remote settings without asking.

### Behaviour

- [x] 7-day admin inactivity sign-out is built in the app, because Supabase's session time-box and inactivity timeout are Pro-plan features ([source](https://supabase.com/docs/guides/auth/sessions)).
- [x] Keep-alive runs daily at 04:17 UTC (06:17 in Kigali).
- [x] Test coverage target: 80% of lines in src/lib.
- [x] Uploads go straight to Supabase Storage through signed upload URLs, not through Vercel functions.

### Sources

- [Vercel: Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Supabase: Billing FAQ (free project limit)](https://supabase.com/docs/guides/platform/billing-faq)
- [Supabase: About billing (image transformations on Free)](https://supabase.com/docs/guides/platform/org-based-billing)
- [Supabase: User sessions](https://supabase.com/docs/guides/auth/sessions)
- npm registry, package versions and peer ranges, checked 12 Nov 2026
