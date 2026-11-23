import type { Metadata } from "next";
import {
  DEFAULT_SHARE_IMAGE,
  SHARE_IMAGE_SIZE,
  SHARE_IMAGE_TYPE,
} from "@/lib/og/constants";

export const SITE_NAME = "Favour Michael";

// Per-page metadata (FR-10.1). Next.js merges `openGraph` and `twitter`
// shallowly, so a page that sets either replaces the layout's object; this
// fills every field each time so nothing falls back to the home page's text.
// The share image is named every time too: a page that sets `openGraph` does
// not inherit the root opengraph-image file. It defaults to the site image;
// case studies pass their own.
export type ShareImage = { url: string; alt: string };

export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  /** Page name; the layout's template adds " · Favour Michael". */
  title?: string;
  description: string;
  /** Site path, made absolute by metadataBase (NEXT_PUBLIC_SITE_URL). */
  path: string;
  /**
   * Replaces the site's default share image. "file" leaves it to an
   * opengraph-image file in the same folder (the root layout only), which
   * Next.js then uses for both cards.
   */
  image?: ShareImage | "file";
}): Metadata {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const chosen = image ?? DEFAULT_SHARE_IMAGE;
  const images =
    chosen === "file"
      ? undefined
      : [{ ...chosen, ...SHARE_IMAGE_SIZE, type: SHARE_IMAGE_TYPE }];
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: path,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images ? { images } : {}),
    },
  };
}
