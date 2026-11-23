import type { Profile } from "@/lib/validation/content";

// schema.org Person for the home page, built only from the profile row, so it
// can never say more than the site does.
export function personJsonLd(profile: Profile, siteUrl: string) {
  const sameAs = [
    profile.github_url,
    profile.linkedin_url,
    profile.x_url,
  ].filter((url): url is string => url !== null);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    jobTitle: profile.headline,
    url: new URL("/", siteUrl).toString(),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

// For a <script type="application/ld+json">. Escaping "<" keeps profile text
// from closing the script tag early (the installed Next.js JSON-LD guide).
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
