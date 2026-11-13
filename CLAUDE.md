@AGENTS.md

# Froches Portfolio v2

Favour Michael's portfolio at froches.tech (portfolio.froches.tech redirects there). A fast, animated public site for recruiters, plus (from slice 1b) a phone-friendly admin panel so Favour can publish projects without touching code. The codebase is itself a portfolio piece: documented, tested, deployed through CI.

## Source of truth

- `docs/prd.md` (requirements, FR-x.y numbers), `docs/technical-design.md` (layout, data model, routes, env vars, tests), `docs/design/` (numbered screenshots) and `docs/design/source/` (canvas source).
- Never invent requirements, content, metrics, dates or copy. All site content comes from Favour's resume or from her directly. If something is missing or two docs disagree: stop and ask Favour.
- Any change to behaviour updates the docs in the same PR.

## Current phase: slice 1a (public v2), launch target Sun 15 Nov 2026

Steps, one branch and one PR each, all branched from `v2`:

1. Scaffold, pinned versions, CI, environments (`chore/scaffold`).
2. Supabase schema, row-level security, automatic RLS test, seed from the resume, keep-alive route and workflow.
3. Design tokens, layout shell, navigation, motion system (reduce-motion and low-power modes).
4. Public pages: home, projects, case study with slideshow, About with fact cards and distance card, resume, command palette, 404, privacy.
5. SEO, share image, sitemap, redirects, Lighthouse and accessibility gates.
6. Launch: merge v2 into main, domains, smoke test.

Out of scope until Favour says otherwise: admin panel and sign-in (slice 1b), contact form, guestbook, first-party counts, Speed Insights (slice 2), per-project share images, WebGL (slice 3), blog, sound, visitor accounts, AI chat, translations, selling services.

## Stack (exact versions, no ^ or ~)

Node 24.x LTS (.nvmrc, engines, Vercel setting). next 16.4.6, react and react-dom 19.3.1, typescript 6.0.3 (NOT 7.x: typescript-eslint supports below 6.1 only), tailwindcss and @tailwindcss/postcss 4.3.5, shadcn 4.23.0 with radix-ui 1.8.1, motion 14.13.0, @supabase/supabase-js 2.119.0, @supabase/ssr 0.12.7, supabase CLI 3.1.0 (dev), zod 4.6.7, embla-carousel-react 8.6.0, cmdk 1.1.1, @vercel/analytics 2.0.1, vitest 5.1.0, @vitejs/plugin-react 6.3.0, vite 8.3.8, jsdom 31.0.0, @testing-library/react 16.3.3, @playwright/test 1.65.0, @axe-core/playwright 4.14.0, @lhci/cli 0.16.1, eslint 10.14.0, eslint-config-next 16.4.6, prettier 3.10.1, prettier-plugin-tailwindcss 0.8.1, husky 9.1.7, lint-staged 17.6.0, @commitlint/cli and @commitlint/config-conventional 21.2.4.

**No new library or service without asking Favour first.** If a pinned version fails, report it with the error; do not swap versions silently.

## Repo layout

```
.github/workflows/      ci.yml, keepalive.yml
docs/                   prd.md, technical-design.md, adr/, design/, design/source/, content/
supabase/               config.toml, migrations/, seed.sql, tests/
src/app/(public)/       home, projects, projects/[slug], about, privacy
src/app/(admin)/admin/  slice 1b only
src/app/api/            route handlers
src/components/ui|motion|public|admin/
src/lib/supabase/       server.ts, browser.ts, service.ts (server-only)
src/lib/content/        typed public queries and cache tags
src/lib/validation/     zod schemas
src/lib/env.ts          validated environment variables
tests/unit/ tests/e2e/
```

## Non-negotiable rules

- **Data isolation:** RLS on every table, default deny. The RLS test discovers tables at run time and fails if any table lacks RLS or a policy. Visitors read published content only. Admin checks happen in the app (`requireAdmin()`) and in the database (`is_admin()`).
- **Public pages never query the database per visit.** They are pre-rendered and refreshed by cache tag. A paused Supabase project must never break a public page.
- **Time:** store UTC; show Africa/Kigali (UTC+2) in admin. Keep-alive runs daily at 04:17 UTC.
- **Secrets:** only in Vercel, GitHub secrets and git-ignored `.env.local`. `.env.example` lists names without values. Server-only modules import `server-only`. `src/lib/env.ts` validates; its schema grows only as each step needs a variable.
- **Privacy:** no third-party trackers or cookies on public pages. Never store an IP address. The distance card's route reads Vercel's rough-location headers, returns a rounded distance and stores nothing.
- **Platform quirks:** read the installed Next.js docs before using any Next API (see AGENTS.md). Supabase Free pauses after a week idle and allows two projects. Vercel Hobby is personal, non-commercial. Uploads go to Storage through signed URLs, never through a Vercel function.
- **Accessibility:** WCAG 2.2 AA. Real buttons and links, visible focus, labelled inputs, alt text required, touch targets at least 44 px, contrast checked in both themes. Going back restores scroll position (FR-1.4).
- **Motion:** native scrolling only, no smooth-scroll or scroll-jacking library. Scroll-linked motion with `motion`, one orchestrated entrance per page, micro-interactions CSS-first using transform and opacity only, press states on touch, everything off under `prefers-reduced-motion`. Motion never blocks reading or clicking.
- **Design tokens (from docs/design):**
  - Light: ground #F1F4F0, surface #FFFFFF, ink #15231E, muted #4F5D57, line #D3DBD5, accent text #8A5A00, accent fill #E9A93B, contour #BCC9C1.
  - Dark: ground #10201B, surface #182C26, ink #E8EEE9, muted #A3B5AD, line #2A403A, accent text and fill #F2B544, contour #2D4B42.
  - Type: Schibsted Grotesk only (400 to 800) via next/font. Radii 12, 14, 16, 20, 24 px. Signature motif: topographic contour lines; phone fact cards carry floating doodles.
  - Use tokens, never raw hex in components.
- **Content truth:** nothing may contradict Favour's resume. No placeholder copy ships; missing content is hidden or flagged to Favour.

## Workflow

1. Start every step in plan mode. The plan lists files, exact dependencies, tests, docs to update, and open questions. Wait for Favour's approval.
2. One branch and one PR per step, from `v2`. Run `git status` before every commit.
3. Conventional Commits with FR numbers, for example `feat(projects): add case study slideshow (FR-2.4)`.
4. Before opening a PR, run lint, typecheck, unit tests, e2e tests and build, and report the real output. Never claim a check passed without running it.
5. If a test fails, explain whether the test or the code is wrong, with proof, before changing either.
6. Pushing your own step branch and opening its PR is fine after the plan is approved. Ask before any other remote change: GitHub settings, Vercel, Supabase projects, DNS, secrets, merging.
7. Never put tokens in git remote URLs.
8. When a session ends mid-step, save a short handoff note (what is done, what is next, open questions) and print a continuation prompt.

## Writing style

Plain, specific English. No em dashes, no filler, no clichés. UI copy in sentence case; buttons say exactly what they do. Comments explain why, not what.