import { z } from "zod";

// Grows one variable at a time, as each step needs it (technical-design section 6).

// Only web URLs: z.url() alone would also accept ftp:, mailto: and similar schemes.
const webUrl = z.url({ protocol: /^https?$/ });

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: webUrl,
  NEXT_PUBLIC_SUPABASE_URL: webUrl,
  // Public variables reach the browser, so anything but a publishable key
  // (for example a pasted secret key) is refused.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .regex(
      /^sb_publishable_\S+$/,
      "must be a publishable key (sb_publishable_...)",
    ),
});

const serverSchema = z.object({
  CRON_SECRET: z.string().min(32),
  // Set by Vercel for each deployment, absent locally and in CI. Decides
  // whether the build sends noindex (src/lib/seo/indexing.ts).
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
});

export type Env = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

type Source = Record<string, string | undefined>;

function parseWith<T extends z.ZodType>(schema: T, source: Source): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    // zod messages name the rule, never the value, so secrets are not printed.
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ");
    throw new Error(`Invalid environment variables:\n  ${problems}`);
  }
  return result.data;
}

export function parseEnv(source: Source): Env {
  return parseWith(publicSchema, source);
}

// Kept here, without server-only, so next.config.ts can validate secrets at
// build time. Runtime code reads them through src/lib/server-env.ts.
export function parseServerEnv(source: Source): ServerEnv {
  return parseWith(serverSchema, source);
}

// Each NEXT_PUBLIC_ variable is read by its full literal name so Next.js can
// inline it into browser bundles; spreading process.env would leave it undefined there.
export const env = parseEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
