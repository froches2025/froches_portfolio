# Froches Portfolio v2: PRD

Nov 12, 2026 · @Favour Michael · Status: draft for review

## 1. Overview

Portfolio v2 is a rebuild of Favour Michael's portfolio as a content-managed web application: a fast, animated public site for recruiters, and a phone-friendly admin panel so Favour can publish projects without touching code. Items marked (proposed) are not yet confirmed.

### Problem

- **Content drift.** The live site (portfolio.froches.tech) disagreed with the resume on dates, titles, links and projects. Every content change needs a code change and a laptop.
- **Thin proof.** Only one project was listed, with no case study, links or images. Recruiters cannot see how Favour works.
- **No engineering signal.** The repo has no tests, CI, docs or architecture. The site itself is the first code sample a reviewer opens.

### Vision

A recruiter lands on froches.tech and, within 10 seconds, knows who Favour is, sees her strongest work, and can download her resume. The site feels alive and crafted, but never hides information behind the animation. Behind it, the codebase reads like a small production system: documented, tested, deployed through CI.

### Users

| User | Who | Main need |
| --- | --- | --- |
| Recruiter or hiring manager (primary) | Reviewing internship and junior applications, often on a laptop, sometimes on a phone | Find the best projects, proof of skill and the resume fast |
| Engineer reviewer | Technical interviewer or mentor who opens the GitHub repo | See clean architecture, tests and decisions |
| Visitor (peers, community) | ALU students, Builders Club, event contacts across Africa | Browse work, leave a guestbook message, get in touch |
| Admin (Favour only) | Signs in with GitHub, often from her phone | Add and edit projects, images, resume and content; moderate the guestbook; read messages |

### Success metrics

| Metric | Target | How it is measured |
| --- | --- | --- |
| Interview callbacks that mention the site (primary) | At least 1 in the first 3 months after launch | Favour logs it manually |
| Time to publish a new project from a phone | Under 10 minutes, no code | Timed by Favour on the first real project |
| Mobile Lighthouse scores | 90+ performance, 100 accessibility, 100 best practices, 100 SEO | Lighthouse CI on every PR |
| Resume downloads and contact sends | Tracked from launch, no target yet | First-party counts in the admin panel |
| Content accuracy | Zero mismatches with the resume at launch | Pre-launch content checklist |

## 2. Scope

Slice 1 is split so the new site can launch by 15 Nov: slice 1a replaces the live site with database-backed public pages, and slice 1b adds the admin panel that edits them. Contact, guestbook and analytics follow in slice 2. The slice split was confirmed on 12 Nov 2026.

| Slice | Contents | Ships when |
| --- | --- | --- |
| 0. Hotfix (done outside this PRD) | Current site content synced to the resume, resume PDF, froches.tech domain | 12 Nov 2026 |
| 1a. Public v2 | New design. Home, projects list, case study pages with image slideshow, About, resume download, command palette. Supabase schema with row-level security, seeded from the resume. CI, tests, docs. v2 replaces the live site and portfolio.froches.tech redirects to froches.tech. | Sun 15 Nov 2026 |
| 1b. Admin | GitHub sign-in locked to Favour, projects with draft and published, image upload, featured order by hand, resume upload, and editing of profile, About, experience, education, roles and skills. Until it ships, content changes go through reviewed Claude Code PRs. | About 22 Nov 2026 (proposed) |
| 2. Engage | Contact form with admin inbox, email to Favour and auto-reply. Guestbook with bot check, approval queue and email alert. First-party counts (resume downloads, contact sends, guestbook posts, project link clicks) in the admin panel. Vercel Speed Insights. | After slice 1b |
| 3. Delight | Playful details such as a small pop-out easter egg, per-project share images, motion polish. Optional WebGL hero only if it passes the performance budget. | Agile sprints after slice 2 |

### Out of scope

- Blog or notes section.
- Sound effects.
- A game-like or 3D world as the main navigation (information must never be hidden behind play).
- Visitor accounts or sign-in for the guestbook.
- More than one admin.
- Selling services, prices or bookings on the site (would break Vercel Hobby's non-commercial terms, see section 8).
- AI chat about Favour.
- Translations.

## 3. Functional requirements

Fifty requirements in 11 groups. Every commit and PR cites the FR numbers it touches. The slice column matches section 2; a plain 1 means slice 1a.

### FR-1 Public shell and navigation

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-1.1 | Home shows name, role, a one-line pitch and three actions: View projects, Download resume, Contact. | 1 |
| FR-1.2 | Home shows featured projects in the order Favour sets by hand, up to 4. | 1 |
| FR-1.3 | Desktop: persistent side navigation that highlights the section in view. Phone: compact menu. Layout direction inspired by Brittany Chiang, made more dynamic. | 1 |
| FR-1.4 | Going back from any page restores the previous scroll position and state. The page never resets to the start. | 1 |
| FR-1.5 | Footer and nav carry GitHub (froches2025), LinkedIn (froches), X (froches\_) and email links. | 1 |
| FR-1.6 | Keyboard command palette for quick navigation (carried over from v1). | 1a |
| FR-1.7 | Scrolling feels smooth, immersive and luxurious: the contour lines move with the scroll, headings and project images reveal as they enter, the experience timeline draws itself, and each page has one orchestrated entrance. Built on the browser's own scrolling with scroll-linked motion; no animation blocks reading, and reduce-motion turns it off (added 13 Nov; no smooth-scroll library, so it stays fast on every device). | 1a |
| FR-1.8 | Almost every interactive element has a micro-interaction so the site feels alive: buttons lift on hover and press in on tap, links draw an underline, cards lift slightly, chips nudge, and the doodles on phone fact cards float and speed up when touched. CSS-first, transform and opacity only, press states on touch screens, all off with reduce-motion (added 13 Nov). | 1a |

### FR-2 Projects

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-2.1 | Projects page lists published projects in Favour's manual order, each with cover image, title, one-liner, year and stack tags. | 1 |
| FR-2.2 | Each project has: title, slug, one-liner, year, status (live, in development, archived), live URL, repo URL, stack tags and cover image. | 1 |
| FR-2.3 | Case study page shows up to 8 sections: problem, my role, stack, approach or architecture, challenges, outcome or metrics, links, gallery. Empty sections are hidden, never shown blank. | 1 |
| FR-2.4 | Gallery is a slideshow inspired by olaolu.dev/work/conectar: swipe on phones, arrow keys and buttons on desktop, caption and required alt text per image. | 1 |
| FR-2.5 | Draft projects never appear publicly: not listed, not in the sitemap, and their URL returns 404. | 1 |
| FR-2.6 | Case study page links to the previous and next project in the manual order. | 1 |

### FR-3 About

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-3.1 | About page tells Favour's story with bio, experience timeline, education, leadership roles and skills. Depth inspired by Josh Comeau's About page. | 1 |
| FR-3.2 | A headshot is optional; the page works without one. | 1 |
| FR-3.3 | Desktop About opens with a greeting, story and portrait, then a grid of fact cards inspired by Josh Comeau's About page. One card shows how far Kigali is from the visitor, worked out from Vercel's rough location headers through a small route that stores nothing; the page itself stays pre-built. Phone shows the same cards in one column (added 13 Nov). | 1a |
| FR-3.4 | Education and experience entries can show a View certificate link (ALX and HNG first). Certificate images are hosted by the site itself, not linked from Google Drive, so links never break (added 13 Nov). | 1a |

### FR-4 Resume

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-4.1 | Download resume is available from home, nav and About, and serves the latest PDF uploaded in admin. | 1 |
| FR-4.2 | The resume has one stable public URL. The v1 path /resume-favour-michael.pdf redirects to it, so links already sent keep working. | 1 |

### FR-5 Admin sign-in

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-5.1 | Admin signs in with GitHub. Only the froches2025 account, matched by its permanent GitHub user ID, gets access. Anyone else is signed out and shown a denied page. | 1b |
| FR-5.2 | Admin pages are never cached, never indexed, and every admin action is re-checked on the server. | 1b |
| FR-5.3 | Admin can sign out; sessions expire after inactivity (7 days). | 1b |

### FR-6 Admin content management

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-6.1 | Create, edit and delete projects, each saved as draft or published. A draft can be previewed exactly as it will look before publishing. | 1b |
| FR-6.2 | Upload, replace, reorder and delete project images. Alt text is required. Images are resized and compressed; size limit 10 MB per upload. | 1b |
| FR-6.3 | Toggle featured and set the order of projects and featured projects by hand (move up and down on phone, drag on desktop). | 1b |
| FR-6.4 | Saving published content updates the affected public pages within 60 seconds, without a redeploy. | 1b |
| FR-6.5 | Edit profile (name, headline, bio, email, social links), experience, education, roles and skills. | 1b |
| FR-6.6 | Upload a new resume PDF (PDF only, 5 MB limit). | 1b |
| FR-6.7 | Every admin screen works one-handed on a 360 px wide phone. | 1b |
| FR-6.8 | Leaving a form with unsaved changes asks for confirmation. | 1b |

### FR-7 Contact

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-7.1 | Contact form takes name, email and message (all required) and passes a bot check before sending. | 2 |
| FR-7.2 | Each message is saved to the admin inbox and emailed to f.michael@alustudent.com. | 2 |
| FR-7.3 | The sender gets an auto-reply with fixed text that never repeats their message. It is sent only after the bot check passes, and is rate-limited per IP (3 per hour). | 2 |
| FR-7.4 | Admin inbox lists messages with read, unread, archive and delete. | 2 |
| FR-7.5 | The form shows clear sending, success and error states. | 2 |

### FR-8 Guestbook

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-8.1 | Anyone can post without signing in. Message is required (500 characters max). Name, role and country are optional; country uses a picker with flags. | 2 |
| FR-8.2 | Posting passes a bot check and is rate-limited per IP. | 2 |
| FR-8.3 | New entries are pending until Favour approves them. Admin can approve, reject or delete. | 2 |
| FR-8.4 | Each new entry emails Favour with a link straight to the approval queue. | 2 |
| FR-8.5 | The public guestbook shows approved entries, newest first. | 2 |

### FR-9 Analytics

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-9.1 | Vercel Web Analytics records page views. | 1 |
| FR-9.2 | The site counts resume downloads, contact sends, guestbook posts and project link clicks in its own database, storing no IP address or personal data. | 2 |
| FR-9.3 | Admin dashboard shows those counts by week. | 2 |
| FR-9.4 | Vercel Speed Insights records real-visitor performance. | 2 |

### FR-10 SEO and sharing

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-10.1 | Every public page has a title, description and canonical URL on froches.tech. | 1 |
| FR-10.2 | Sitemap lists published pages only; robots blocks /admin. | 1 |
| FR-10.3 | Every page has a share image; each project gets its own. | 1 (site), 3 (per project) |

### FR-11 Domains

| ID | Requirement | Slice |
| --- | --- | --- |
| FR-11.1 | froches.tech serves the site as the primary domain. | 1 |
| FR-11.2 | portfolio.froches.tech keeps working for every link already sent. At v2 launch it permanently redirects each path to the same path on froches.tech, so links in applications already sent never break. | 1 |

## 4. Non-functional requirements

The site must be quick on a mid-range Android phone on patchy mobile data, accessible to everyone, and cost $0 a month to run.

| ID | Area | Requirement |
| --- | --- | --- |
| NFR-1 | Performance | Mobile Lighthouse performance 90+ on home, projects and a case study, checked in CI (proposed). Largest Contentful Paint under 2.5 s and layout shift under 0.1 on a throttled 4G profile. |
| NFR-2 | Motion | Full animation on capable devices. A lighter mode for low-power devices and for anyone with reduce-motion switched on: content and meaning stay identical, only motion changes. No animation blocks reading or clicking. |
| NFR-3 | Accessibility | WCAG 2.2 AA: keyboard reachable, visible focus, colour contrast, alt text, labelled forms, screen-reader tested. Lighthouse accessibility 100 and automated axe checks in CI. |
| NFR-4 | Resilience | Public pages are pre-built and do not query the database when a visitor loads them, so a paused or slow database never breaks what a recruiter sees. |
| NFR-5 | Security | Row-level security on every table, enforced by a test that finds all tables automatically. Secrets live only in environment variables, never in git. Server-side checks on every admin action. Security headers (CSP, HSTS, frame and referrer policies). Uploads checked for type and size. |
| NFR-6 | Privacy | No third-party trackers or cookies on public pages. Analytics store no IP or personal data. Contact and guestbook data are used only to reply and moderate; deleting a message or entry removes it fully. A short privacy note on the site. |
| NFR-7 | Abuse | Contact and guestbook pass a bot check and per-IP rate limits. The auto-reply never echoes visitor text (FR-7.3). |
| NFR-8 | Quality | TypeScript strict mode, lint and format checks, unit and component tests, end-to-end tests for the main visitor and admin journeys, all run in CI on every PR. Main is protected: green CI before merge. |
| NFR-9 | Documentation | README, architecture overview, decision records, environment variable list, and these docs exported to docs/ in the repo. Docs change in the same PR as the code. |
| NFR-10 | Browsers | Latest two versions of Chrome, Safari, Firefox and Edge, plus Chrome on Android and Safari on iOS. |
| NFR-11 | Cost | $0 a month: Vercel Hobby, Supabase Free, Resend Free and free bot-check tier. The only planned cost is the domain renewal (section 8). |
| NFR-12 | Content truth | Nothing on the site may contradict the resume. No invented metrics or claims anywhere in code, seeds or tests. |

## 5. Architecture

One Next.js app on Vercel serves pre-built public pages and a server-checked admin panel. Supabase holds data, sign-in and files. Resend sends email and Cloudflare Turnstile blocks bots. Every service is on a free tier.

&#91;embedded content: System architecture · 1 app, 3 services, GitHub CI\]

Publishing in the admin panel writes to Supabase, then tells Next.js to rebuild only the affected pages. Visitors always get a ready-made page, so a paused database cannot break the public site.

| Part | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript (same stack as v1) | Confirmed by Favour; supports pre-built pages refreshed on demand |
| Styling and UI | Tailwind CSS v4, shadcn/ui on Radix | Same stack; Radix gives accessible primitives |
| Motion | Framer Motion, honouring reduce-motion | Same stack; three.js only if it passes the performance budget (slice 3) |
| Data, auth, files | Supabase Free: Postgres with row-level security, GitHub sign-in, Storage | Confirmed by Favour |
| Email | Resend Free | 100 emails a day is enough for alerts and auto-replies |
| Bot check | Cloudflare Turnstile Free | No puzzle for visitors, no request cap |
| Hosting | Vercel Hobby, auto-deploy from GitHub | Already set up |
| CI | GitHub Actions: lint, types, tests, build, Lighthouse, scheduled keep-alive | Free for public repos |
| DNS | Namify, pointing froches.tech and portfolio.froches.tech to Vercel | Where the domain is registered |

## 6. Data model overview

Ten content tables, one internal rate-limit table and two storage buckets. Visitors can read only published content. Only Favour's account can write content, and visitor submissions enter only through server actions after the bot check. Every column and rule is specified in the technical design.

| Table | Holds | Public can read | Written by | Slice |
| --- | --- | --- | --- | --- |
| profile | One row: name, headline, bio, email, social links, current resume file, optional headshot | Yes | Admin | 1 |
| projects | Title, slug, one-liner, year, status, links, stack tags, the case study sections, draft or published, featured flag, manual order, featured order | Published rows only | Admin | 1 |
| project\_images | Image file, alt text, caption, order, linked to a project | Images of published projects only | Admin | 1 |
| experience | Role, organisation, dates, bullet points, order | Yes | Admin | 1 |
| education | Programme, institution, dates, detail, order | Yes | Admin | 1 |
| roles | Leadership and community roles with dates and detail | Yes | Admin | 1 |
| skills | Skill groups (languages, frontend, backend...) and their items | Yes | Admin | 1 |
| contact\_messages | Name, email, message, read or archived, received time | No | Server action (insert), admin (read, update, delete) | 2 |
| guestbook\_entries | Message, optional name, role and country code, pending or approved or rejected, times | Approved rows only | Server action (insert), admin (moderate) | 2 |
| event\_counts | Event type, optional project, day, count. No IP or personal data. | No | Server action (increment), admin (read) | 2 |

| Bucket | Holds | Public can read | Written by |
| --- | --- | --- | --- |
| project-images | Compressed project images | Yes | Admin |
| documents | Resume PDF, headshot | Yes | Admin |

Rules that cut across tables:

- Deleting a project deletes its images and their files, so no orphan files remain.
- Rate limits are kept in a short-lived table of salted, one-way hashes that are deleted after 24 hours, so no raw IP address is ever stored (proposed).
- Favour's admin identity is her GitHub user ID, stored as configuration, never a username that can change.

## 7. Delivery plan

Four design phases each end at Favour's approval. Then slice 1 is built in nine reviewed steps on the v2 branch, and v2 replaces the live site only when the launch checklist is green. Schedule (agreed 12 Nov): technical and visual design on Fri 13 Nov, handoff and steps 1 to 3 on Sat 14 Nov, steps 4 to 6 and the 1a launch on Sun 15 Nov. Slice 1b follows around 22 Nov (proposed).

&#91;embedded content: Delivery roadmap · 4 gated phases, 4 build stages, not to scale\]

Slice 1 build steps. Each is one branch, one plan reviewed before code, one PR with green CI. Steps 1 to 6 are slice 1a; steps 7 to 9 are slice 1b:

1. Scaffold v2, pinned versions, CI pipeline, environments (chore/scaffold).
2. Supabase schema, row-level security, the automatic RLS test, seed data taken from the resume.
3. Design tokens, layout shell, navigation, motion system with reduce-motion and low-power modes.
4. Public pages: home, projects, case study with slideshow, About, resume download, command palette.
5. SEO, share image, sitemap, redirects, Lighthouse and accessibility checks in CI.
6. Launch 1a: merge v2 into main, froches.tech as primary, portfolio.froches.tech redirects, smoke test on phone and laptop.
7. Admin sign-in with GitHub, locked to Favour's user ID.
8. Admin projects: create, edit, draft and publish, images, featured and manual order, page refresh on save.
9. Admin profile, experience, education, roles, skills and resume upload.

## 8. Risks and open questions

The biggest risk is the domain: everything Favour has deployed sits under froches.tech, which has auto-renew off and costs $29.99 to renew in July 2027.

| Risk | Impact | Mitigation | Source |
| --- | --- | --- | --- |
| froches.tech expires 20 Jul 2027; auto-renew is disabled; renewal is $29.99 a year | Portfolio, LifeTrack, AidReady Finder and the sauce site all go offline | Decide before June 2027 whether to renew; reminder scheduled for 1 June 2027 | Namify dashboard, seen 12 Nov 2026 |
| Supabase Free pauses a project after a week of low activity | Admin, contact and guestbook stop until restored | Public pages never read the database per visit (NFR-4); scheduled GitHub Actions ping | [Supabase: project pausing](https://supabase.com/kb/faqs/platform/free-project-pausing) |
| Vercel Hobby allows personal, non-commercial use only | Account could be restricted if the site sells services | Portfolio and contact only; no prices or bookings | [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) |
| Vercel Web Analytics on Hobby: 50,000 events a month shared across all projects; custom events need Pro | Page views may stop late in a busy month; no click tracking | First-party counts in Supabase (FR-9.2) | [Vercel analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing) |
| Resend Free sends 100 emails a day | Alerts or auto-replies fail on a spam burst | Bot check and rate limits before any email; messages are saved even if email fails | [Resend sending limits](https://resend.com/docs/knowledge-base/resend-sending-limits) |
| Spam or abuse through contact and guestbook | Inbox flood, offensive posts | Turnstile (free, up to 20 widgets), per-IP limits, approval before display | [Cloudflare Turnstile plans](https://developers.cloudflare.com/turnstile/plans) |
| Heavy animation slows mid-range phones | Recruiters bounce; Lighthouse fails | Performance budget, low-power mode, Lighthouse CI blocks regressions | NFR-1, NFR-2 |
| Someone takes over Favour's GitHub account | Full admin access | Turn on GitHub two-factor authentication (authenticator app or passkey) on froches2025 before launch, since email device codes alone are not two-factor; admin matched by user ID; server-side checks | FR-5.1 |
| Next.js 16 differs from what AI tools were trained on | Wrong APIs, broken builds | Claude Code reads the installed Next.js docs before coding, as the repo's AGENTS.md requires; versions pinned | Repo AGENTS.md |
| Site content drifts from the resume again | Recruiter trust drops | NFR-12 and a pre-launch content checklist | Section 1 |

### Open questions

- [x] Slice split confirmed, including slice 3.
- [x] Success targets confirmed.
- [x] Home shows up to 4 featured projects.
- [x] Limits confirmed: guestbook 500 characters, contact 3 per hour per IP, images 10 MB, resume 5 MB, admin session 7 days.
- [x] portfolio.froches.tech redirects every path to froches.tech at launch.
- [x] Guestbook alert email links to the approval queue (sign-in required).
- [x] Cloudflare Turnstile is the bot check.
- [x] Launch: slice 1 split; public v2 (1a) by Sun 15 Nov 2026, admin (1b) around 22 Nov.
- [x] Domain renewal reminder scheduled for 1 June 2027.
- [x] GitHub sign-in uses email device codes today; two-factor authentication to be turned on before launch.
- [x] X (x.com/froches\_) is included in social links.
- [x] Command palette is kept (FR-1.6), moved into slice 1a.
- [x] Deleting a project deletes its image files.

### Sources

- [Supabase: Do projects pause when inactive?](https://supabase.com/kb/faqs/platform/free-project-pausing)
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel Web Analytics pricing](https://vercel.com/docs/analytics/limits-and-pricing)
- [Vercel custom events](https://vercel.com/docs/analytics/custom-events)
- [Resend sending limits](https://resend.com/docs/knowledge-base/resend-sending-limits)
- [Cloudflare Turnstile plans](https://developers.cloudflare.com/turnstile/plans)
