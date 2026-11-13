# ADR 0001: Platform versions

- Status: accepted
- Date: 13 Nov 2026
- Decided by: Favour Michael

## Context

Portfolio v2 is rebuilt from scratch on exact, pinned versions (technical-design section 1). Four choices needed a reason on record because they differ from the newest release or from v1:

1. Vercel offers Node.js 24.x and 26.x, and 26.x is its default.
2. TypeScript 7.0.2 is the newest TypeScript.
3. v1 used `framer-motion`.
4. The technical design pinned ESLint 10.14.0.

## Decision

### Node.js 24 LTS

The repo pins Node 24 in `.nvmrc`, in `package.json` `engines` (`24.x`) and in the Vercel project setting. Node 24 has been available for a year longer than 26, so the libraries in this stack have had longer to support it. Every pinned package that declares an engine range accepts 24 (the strictest is lint-staged 17.6.0, which needs 22.22.1 or later).

Source: [Vercel, supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

### TypeScript 6.0.3, not 7

`eslint-config-next` lints TypeScript through typescript-eslint, and typescript-eslint 8.72.2 declares a peer range of `typescript >=4.8.4 <6.1.0`. TypeScript 7 would fall outside it, so 6.0.3 is the newest version the linter supports.

Source: npm registry, `typescript-eslint@8.72.2` peer dependencies, checked 12 Nov 2026.

### `motion`, not `framer-motion`

`motion` is the current package name of Framer Motion: same library and API, published under the new name. New code imports from `motion/react`. It is installed in step 3, when the motion system is built.

### ESLint 9.39.5, not 10.14.0

`eslint-config-next` 16.4.6 depends on three plugins whose peer ranges stop at ESLint 9:

| Plugin                 | Version | Peer range for `eslint` |
| ---------------------- | ------- | ----------------------- |
| eslint-plugin-react    | 7.37.5  | `^3 \|\| ... \|\| ^9.7` |
| eslint-plugin-import   | 2.32.0  | `^2 \|\| ... \|\| ^9`   |
| eslint-plugin-jsx-a11y | 6.10.2  | `^3 \|\| ... \|\| ^9`   |

None has a release that accepts ESLint 10, so installing 10.14.0 fails with `ERESOLVE`. Forcing it with npm `overrides` would run the plugins on a major version they were never tested on. ESLint 9.39.5 is the newest 9.x release.

Source: npm registry, peer dependencies of each plugin, checked 13 Nov 2026.

## Consequences

- npm prints a deprecation notice at install: "eslint@9.39.5: This version is no longer supported." ESLint runs only in development and CI, never in the deployed site, so this is accepted until the plugins catch up. Move to ESLint 10 as soon as all three accept it, and re-check when versions are reviewed at the start of each slice.
- TypeScript stays on 6.0.x until typescript-eslint supports 7.
- Vercel's Node.js setting must be set to 24.x by hand, since 26.x is its default.
