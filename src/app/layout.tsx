import type { Metadata } from "next";
import { Geist, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CommandPalette } from "@/components/command-palette";
import { CustomCursor } from "@/components/custom-cursor";
import { LoadSequence } from "@/components/load-sequence";
import { TelemetryTrackerMount } from "@/components/telemetry-tracker-mount";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const siteUrl = "https://portfolio.froches.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Favour Michael — Software Engineer",
    template: "%s — Favour Michael",
  },
  description:
    "Frontend-focused software engineer building fast, reliable interfaces — from campus navigation to AI-powered products.",
  openGraph: {
    title: "Favour Michael — Software Engineer",
    description:
      "Frontend-focused software engineer building fast, reliable interfaces — from campus navigation to AI-powered products.",
    url: siteUrl,
    siteName: "Favour Michael",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Favour Michael — Software Engineer",
    description:
      "Frontend-focused software engineer building fast, reliable interfaces — from campus navigation to AI-powered products.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-bg-void text-text-primary"
        suppressHydrationWarning
      >
        <LoadSequence />
        <CustomCursor />
        <SiteNav />
        <TelemetryTrackerMount />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CommandPalette />
      </body>
    </html>
  );
}
