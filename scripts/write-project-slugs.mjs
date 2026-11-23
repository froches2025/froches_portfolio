#!/usr/bin/env node
// Prebuild step: writes the published project slugs into the deployment, so
// src/proxy.ts can answer unknown /projects/<slug> URLs with the prerendered
// 404 without querying Supabase (NFR-4). Runs before `next build` and `next dev`.
//
// Fails the build if the query fails or returns no slugs: shipping an empty
// allowlist would turn every case study into a 404.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";

const OUTPUT = "src/generated/project-slugs.json";
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function fail(message) {
  console.error(`write-project-slugs: ${message}`);
  process.exit(1);
}

// Vercel and CI provide the variables; locally they come from .env.local.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is not set.");
if (!key) fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set.");

// The publishable key reads only what visitors may read: published projects.
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await supabase
  .from("projects")
  .select("slug")
  .eq("is_published", true)
  .order("sort_order");

if (error) fail(`could not read project slugs: ${error.message}`);
const slugs = (data ?? []).map((row) => row.slug);
if (slugs.length === 0)
  fail(
    "Supabase returned no published projects; refusing to write an empty allowlist.",
  );
const invalid = slugs.filter(
  (slug) => typeof slug !== "string" || !SLUG.test(slug),
);
if (invalid.length > 0)
  fail(`invalid slugs from Supabase: ${invalid.join(", ")}`);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, `${JSON.stringify(slugs, null, 2)}\n`);
console.log(
  `write-project-slugs: ${slugs.length} published slugs written to ${OUTPUT}`,
);
