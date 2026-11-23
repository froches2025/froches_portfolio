#!/usr/bin/env node
// Post-build check (NFR-4, FR-10): the public routes that must never render
// at request time are in the build's prerender manifest. That covers every
// published case study and its share image, from the same slug allowlist the
// proxy uses. A route missing here would render, and query Supabase, on its
// first visit instead. Run after `next build`.

import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync(".next/prerender-manifest.json", "utf8"),
);
const slugs = JSON.parse(
  readFileSync("src/generated/project-slugs.json", "utf8"),
);

const expected = [
  "/",
  "/projects",
  "/about",
  "/privacy",
  "/resume",
  "/opengraph-image",
  "/sitemap.xml",
  "/robots.txt",
  ...slugs.flatMap((slug) => [
    `/projects/${slug}`,
    `/projects/${slug}/share.png`,
  ]),
];

const prerendered = new Set(Object.keys(manifest.routes));
const missing = expected.filter((route) => !prerendered.has(route));

if (missing.length > 0) {
  console.error(
    `check-prerendered: not prerendered at build:\n  ${missing.join("\n  ")}`,
  );
  process.exit(1);
}
console.log(
  `check-prerendered: all ${expected.length} routes prerendered (${slugs.length} case studies with share images).`,
);
