import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/content/queries";
import { env } from "@/lib/env";

const PAGES = ["/", "/projects", "/about", "/privacy"] as const;

// FR-10.2: published pages only. The slug list is the same cached, RLS-limited
// list the case studies prerender from, so drafts never appear; the sitemap is
// built with the site and refreshed with that cache tag.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs();
  return [...PAGES, ...slugs.map((slug) => `/projects/${slug}`)].map(
    (path) => ({ url: new URL(path, env.NEXT_PUBLIC_SITE_URL).toString() }),
  );
}
