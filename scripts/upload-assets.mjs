#!/usr/bin/env node
// Uploads the resume and certificate images to production Supabase Storage and
// records their paths. Run by Favour from her machine; never in CI.
//
//   node scripts/upload-assets.mjs --dry-run   # shows what would change
//   node scripts/upload-assets.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from the git-ignored
// .env.production.local. The key is never printed. Safe to re-run: unchanged
// files are skipped, and resume_updated_at only moves when the PDF changes.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ENV_FILE = ".env.production.local";
const BUCKET = "documents";
const dryRun = process.argv.includes("--dry-run");

const ASSETS = [
  {
    file: "docs/content/resume/resume-favour-michael.pdf",
    path: "resume/favour-michael.pdf",
    contentType: "application/pdf",
    record: "resume",
  },
  {
    file: "docs/content/certificates/alx-certificate.png",
    path: "certificates/alx.png",
    contentType: "image/png",
    record: { table: "education", match: ["institution", "ALX"] },
  },
  {
    file: "docs/content/certificates/hng-certificate.png",
    path: "certificates/hng.png",
    contentType: "image/png",
    record: {
      table: "experience",
      match: ["organisation", "HNG Internship (Cohort 11, frontend track)"],
    },
  },
];

function stop(message) {
  console.error(`upload-assets: ${message}`);
  process.exit(1);
}

function loadEnvironment() {
  if (!existsSync(ENV_FILE))
    stop(
      `${ENV_FILE} not found. Create it with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.`,
    );
  process.loadEnvFile(ENV_FILE);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !/^https:\/\//.test(url))
    stop("NEXT_PUBLIC_SUPABASE_URL is missing or not https.");
  // Only the variable name is ever printed, never its value.
  if (!key || !key.startsWith("sb_secret_"))
    stop(
      "SUPABASE_SECRET_KEY is missing or is not a secret key (sb_secret_...).",
    );
  return { url, key };
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function remoteHash(supabase, path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) return null; // Not there yet.
  return sha256(Buffer.from(await data.arrayBuffer()));
}

async function updateRecord(supabase, asset, changed) {
  if (asset.record === "resume") {
    const { data: profile, error } = await supabase
      .from("profile")
      .select("resume_path")
      .single();
    if (error) stop(`could not read the profile: ${error.message}`);
    if (profile.resume_path === asset.path && !changed) return "unchanged";
    const update = {
      resume_path: asset.path,
      ...(changed || !profile.resume_path
        ? { resume_updated_at: new Date().toISOString() }
        : {}),
    };
    if (dryRun) return "would update profile.resume_path";
    const result = await supabase
      .from("profile")
      .update(update)
      .eq("singleton", true);
    if (result.error)
      stop(`could not update the profile: ${result.error.message}`);
    return "updated profile.resume_path";
  }

  const { table, match } = asset.record;
  const [column, value] = match;
  const { data: rows, error } = await supabase
    .from(table)
    .select("id, certificate_path")
    .eq(column, value);
  if (error) stop(`could not read ${table}: ${error.message}`);
  if (rows.length !== 1)
    stop(
      `expected exactly one ${table} row where ${column} = "${value}", found ${rows.length}.`,
    );
  if (rows[0].certificate_path === asset.path) return "unchanged";
  if (dryRun) return `would update ${table}.certificate_path`;
  const result = await supabase
    .from(table)
    .update({ certificate_path: asset.path })
    .eq("id", rows[0].id);
  if (result.error) stop(`could not update ${table}: ${result.error.message}`);
  return `updated ${table}.certificate_path`;
}

async function main() {
  const { url, key } = loadEnvironment();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  console.log(
    `${dryRun ? "Dry run against" : "Uploading to"} ${new URL(url).host}, bucket ${BUCKET}`,
  );

  for (const asset of ASSETS) {
    const bytes = readFileSync(asset.file);
    const changed = (await remoteHash(supabase, asset.path)) !== sha256(bytes);
    let fileResult = "unchanged";
    if (changed) {
      fileResult = dryRun ? "would upload" : "uploaded";
      if (!dryRun) {
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(asset.path, bytes, {
            contentType: asset.contentType,
            upsert: true,
            cacheControl: "3600",
          });
        if (error) stop(`could not upload ${asset.path}: ${error.message}`);
      }
    }
    const recordResult = await updateRecord(supabase, asset, changed);
    console.log(
      `- ${asset.path} (${(bytes.length / 1024).toFixed(0)} KB): ${fileResult}; ${recordResult}`,
    );
  }
  console.log(
    dryRun
      ? "Dry run only; nothing was written."
      : "Done. Redeploy on Vercel so the pages pick up the new paths.",
  );
}

main().catch((error) =>
  stop(error instanceof Error ? error.message : String(error)),
);
