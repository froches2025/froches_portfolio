import type { Metadata } from "next";
import { MotionPreferenceProvider } from "@/components/motion/motion-preference";
import type { PaletteItem } from "@/components/public/command-palette";
import { LazyCommandPalette } from "@/components/public/lazy-command-palette";
import { PaletteProvider } from "@/components/public/palette-provider";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { SkipLink } from "@/components/public/skip-link";
import { env } from "@/lib/env";
import { schibsted } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: "Favour Michael",
  description:
    "Favour Michael is a software engineer in Kigali, Rwanda, who builds and ships AI-powered products for African users.",
};

// Pages only for now; step 4 adds case studies, the resume, email and links
// from the profile.
const PALETTE_ITEMS: readonly PaletteItem[] = [
  { label: "Home", kind: "Page", href: "/" },
  { label: "Projects", kind: "Page", href: "/projects" },
  { label: "About", kind: "Page", href: "/about" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={schibsted.variable}>
      <body className="flex min-h-dvh flex-col">
        <MotionPreferenceProvider>
          <PaletteProvider>
            <SkipLink />
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <SiteFooter />
            <LazyCommandPalette items={PALETTE_ITEMS} />
          </PaletteProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
