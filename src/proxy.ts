import { NextResponse, type NextRequest } from "next/server";
import publishedSlugs from "@/generated/project-slugs.json";

const KNOWN = new Set<string>(publishedSlugs);

// A path no route matches, so Next.js serves the prerendered 404 page.
const NOT_FOUND_PATH = "/_project-not-found";

// Unknown case-study slugs get the prerendered 404 here, before any rendering,
// so random URLs never reach Supabase even when the database is paused
// (NFR-4, FR-2.5). The allowlist is written at build by
// scripts/write-project-slugs.mjs; publishing a new project in slice 1b
// triggers a redeploy that refreshes it.
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2] ?? "";
  if (KNOWN.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), {
    status: 404,
  });
}

export const config = {
  // Only case studies and the files under them (their share image): the
  // proxy never runs on any other route.
  matcher: ["/projects/:slug", "/projects/:slug/:rest*"],
};
