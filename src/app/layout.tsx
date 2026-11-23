import type { Metadata } from "next";
import { MotionPreferenceProvider } from "@/components/motion/motion-preference";
import { LazyCommandPalette } from "@/components/public/lazy-command-palette";
import { PaletteProvider } from "@/components/public/palette-provider";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { SkipLink } from "@/components/public/skip-link";
import { getProfile, getPublishedProjects } from "@/lib/content/queries";
import {
  hasResume,
  paletteItems,
  RESUME_HREF,
  socialLinks,
} from "@/lib/content/site";
import { env } from "@/lib/env";
import { pageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { schibsted } from "./fonts";
import "./globals.css";

const DESCRIPTION =
  "Favour Michael is a software engineer in Kigali, Rwanda, who builds and ships AI-powered products for African users.";

// FR-10.1. metadataBase makes canonicals and share-image URLs absolute; it is
// https://froches.tech in production (technical-design section 6).
export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  // The image comes from ./opengraph-image.tsx in this same folder.
  ...pageMetadata({ description: DESCRIPTION, path: "/", image: "file" }),
  title: { template: `%s · ${SITE_NAME}`, default: SITE_NAME },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cached at build (see src/lib/content/queries.ts); no query per visit.
  const [profile, projects] = await Promise.all([
    getProfile(),
    getPublishedProjects(),
  ]);

  return (
    <html lang="en" className={schibsted.variable}>
      <body className="flex min-h-dvh flex-col">
        <MotionPreferenceProvider>
          <PaletteProvider>
            <SkipLink />
            <SiteHeader
              resumeHref={hasResume(profile) ? RESUME_HREF : undefined}
            />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <SiteFooter links={socialLinks(profile)} />
            <LazyCommandPalette items={paletteItems(profile, projects)} />
          </PaletteProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
