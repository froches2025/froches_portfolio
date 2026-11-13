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

3. Create your local environment file and set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`:

   ```bash
   cp .env.example .env.local
   ```

4. Install the browsers for end-to-end tests. `--with-deps` installs system libraries and asks for your sudo password.

   ```bash
   npx playwright install --with-deps chromium webkit
   ```

5. Start the dev server at http://localhost:3000:

   ```bash
   npm run dev
   ```

From step 2 of slice 1a, local work also needs Docker for the local Supabase database.

## Scripts

| Script                 | What it does                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the dev server                                                                       |
| `npm run build`        | Builds for production; fails if an environment variable is missing or invalid               |
| `npm run start`        | Serves the production build                                                                 |
| `npm run lint`         | Runs ESLint                                                                                 |
| `npm run format`       | Formats every file with Prettier                                                            |
| `npm run format:check` | Checks formatting without changing files                                                    |
| `npm run typecheck`    | Generates route types, then runs `tsc --noEmit`                                             |
| `npm test`             | Runs the unit tests once (Vitest)                                                           |
| `npm run test:watch`   | Runs the unit tests in watch mode                                                           |
| `npm run test:e2e`     | Runs Playwright with axe on desktop Chromium and mobile WebKit; needs `npm run build` first |
| `npm run lighthouse`   | Runs Lighthouse CI against the production build; needs `npm run build` first                |

WSL has no Chrome, so point Lighthouse at Playwright's Chromium when running it locally:

```bash
CHROME_PATH="$(node -e "console.log(require('playwright-core').chromium.executablePath())")" npm run lighthouse
```

## Contributing

- Branch from `v2` (from `main` after launch): `feat/`, `fix/`, `chore/`, `docs/` or `test/` plus a short slug.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org) and cite FR numbers, for example `feat(projects): add case study slideshow (FR-2.4)`. A git hook checks every message, and CI checks the commits and the PR title.
- CI runs on every pull request to `v2` and `main`: `lint`, `typecheck`, `commitlint`, `unit`, `build`, `e2e` and `lighthouse`.
