import { z } from "zod";

// Grows one variable at a time, as each step needs it (technical-design section 6).
const envSchema = z.object({
  // Only web URLs: z.url() alone would also accept ftp:, mailto: and similar schemes.
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ");
    throw new Error(`Invalid environment variables:\n  ${problems}`);
  }
  return result.data;
}

// Each NEXT_PUBLIC_ variable is read by its full literal name so Next.js can
// inline it into browser bundles; spreading process.env would leave it undefined there.
export const env = parseEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
