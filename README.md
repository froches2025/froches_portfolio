# Froches Portfolio v2

Favour Michael's portfolio, served at [froches.tech](https://froches.tech). It is a fast, animated public site for recruiters and, from slice 1b, a phone-friendly admin panel so Favour can publish projects without touching code. The codebase is part of the portfolio: documented, tested and deployed through CI.

Built with Next.js 16 (App Router), React 19, TypeScript in strict mode, Tailwind CSS 4 and shadcn/ui on Radix. Every dependency is pinned to an exact version.

## Documentation

- [Product requirements](docs/prd.md): what the site does, with FR numbers
- [Technical design](docs/technical-design.md): layout, data model, routes, environment variables, tests and CI
- [Architecture decision records](docs/adr/)
- [Designs](docs/design/) (numbered screenshots) and [design source](docs/design/source/)

## Setup in WSL

1. Install [nvm](https://github.com/nvm-sh/nvm), then use the Node version in `.nvmrc` (24):

   ```bash
   nvm install
   nvm use
   ```

2. Install dependencies from the lockfile. This also installs the git hooks.

   ```bash
   npm ci
   ```

3. Start the local database. It runs in Docker (Docker Desktop with WSL integration, or Docker Engine in WSL), applies every migration in `supabase/migrations/` and loads `supabase/seed.sql`. The first start downloads several GB of images.

   ```bash
   npm run db:start
   ```

4. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

   Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`, take `NEXT_PUBLIC_SUPABASE_URL` (the API URL) and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `npx supabase status`, and set `CRON_SECRET` to the output of `openssl rand -hex 32`.

5. Install the browsers for end-to-end tests. `--with-deps` installs system libraries and asks for your sudo password.

   ```bash
   npx playwright install --with-deps chromium webkit
   ```

6. Start the dev server at http://localhost:3000:

   ```bash
   npm run dev
   ```

## Scripts

| Script                 | What it does                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the dev server                                                                                                       |
| `npm run build`        | Writes the case-study slug allowlist, then builds; needs `db:start`. Fails if an environment variable is missing or invalid |
| `npm run start`        | Serves the production build                                                                                                 |
| `npm run lint`         | Runs ESLint                                                                                                                 |
| `npm run format`       | Formats every file with Prettier                                                                                            |
| `npm run format:check` | Checks formatting without changing files                                                                                    |
| `npm run typecheck`    | Generates route types, then runs `tsc --noEmit`                                                                             |
| `npm test`             | Runs the unit tests once with coverage (fails below 80% of lines in `src/lib`)                                              |
| `npm run test:watch`   | Runs the unit tests in watch mode                                                                                           |
| `npm run test:e2e`     | Runs Playwright with axe on desktop Chromium and mobile WebKit; needs `npm run build` first                                 |
| `npm run lighthouse`   | Runs Lighthouse CI on `/`, `/projects/aidready` and `/about`; needs a running `npm run start`                               |
| `npm run db:start`     | Starts local Supabase in Docker, applies migrations and loads the seed                                                      |
| `npm run db:stop`      | Stops local Supabase (data is kept)                                                                                         |
| `npm run db:reset`     | Recreates the local database from the migrations and the seed                                                               |
| `npm run db:test`      | Runs the pgTAP database tests in `supabase/tests/` (needs `db:start`)                                                       |

Lighthouse audits a running server, as CI does. WSL has no Chrome, so point it at Playwright's Chromium:

```bash
npm run build && npm run start &
for path in / /projects/aidready /about; do curl -s -o /dev/null "http://localhost:3000$path"; done  # warm-up
CHROME_PATH="$(node -e "console.log(require('playwright-core').chromium.executablePath())")" npm run lighthouse
```

Scores on a busy laptop run lower than CI's; CI's `lighthouse` job is the gate.

## Production data

Favour runs these against the production Supabase project; see [technical design section 6](docs/technical-design.md) for the full steps.

1. `npx supabase link --project-ref vkkygdflseadsodyqdbz`, then `npx supabase db push --include-seed` (once).
2. Create the git-ignored `.env.production.local` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY`, then run `node scripts/upload-assets.mjs --dry-run` and `node scripts/upload-assets.mjs` to upload the resume and certificates. It never prints the key and is safe to re-run.
3. Redeploy on Vercel so the pages pick up the data.

## Contributing

- Branch from `v2` (from `main` after launch): `feat/`, `fix/`, `chore/`, `docs/` or `test/` plus a short slug.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) and cite FR numbers, for example `feat(projects): add case study slideshow (FR-2.4)`. A git hook checks every message, and CI checks the commits and the PR title.
- CI runs on every pull request to `v2` and `main`: `lint`, `typecheck`, `commitlint`, `unit`, `database`, `build`, `e2e` and `lighthouse`.
- Database changes go in a new file in `supabase/migrations/`, never by editing an applied one. Every table needs row-level security and a policy; the `database` job fails otherwise.
