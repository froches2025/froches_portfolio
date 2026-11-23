import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// FR-10.2: everything public may be crawled; /admin (slice 1b) may not.
// Previews are kept out of search by their X-Robots-Tag header instead
// (src/lib/seo/indexing.ts), since a robots.txt block would hide that header.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
