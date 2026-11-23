import type { NextConfig } from "next";

// A missing or malformed variable fails `next build`: importing env.ts checks
// the public variables, and parseServerEnv checks the server-only secrets.
import { env, parseServerEnv } from "./src/lib/env";
import { robotsHeaders } from "./src/lib/seo/indexing";

const serverEnv = parseServerEnv(process.env);

// Only our own Supabase Storage public files may go through next/image.
const storagePattern = new URL(
  "/storage/v1/object/public/**",
  env.NEXT_PUBLIC_SUPABASE_URL,
);

const nextConfig: NextConfig = {
  // Pages are prerendered from cached data and refreshed by cache tag (NFR-4).
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [storagePattern],
  },
  // Previews send noindex so only production is indexed (FR-10.2).
  async headers() {
    return robotsHeaders(serverEnv.VERCEL_ENV);
  },
  async redirects() {
    return [
      // Links to the v1 resume keep working (FR-4.2).
      {
        source: "/resume-favour-michael.pdf",
        destination: "/resume",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
