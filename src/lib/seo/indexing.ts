// Only production is indexed. Vercel sets VERCEL_ENV at build for every
// deployment, and next.config's headers() is read at build, so each preview
// carries its own rule. Local and CI builds have no VERCEL_ENV and stay
// indexable, because Lighthouse's SEO audit fails on noindex.
export type VercelEnv = "production" | "preview" | "development";

export function isIndexable(vercelEnv: VercelEnv | undefined): boolean {
  return vercelEnv !== "preview" && vercelEnv !== "development";
}

export function robotsHeaders(vercelEnv: VercelEnv | undefined) {
  if (isIndexable(vercelEnv)) return [];
  return [
    {
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    },
  ];
}
