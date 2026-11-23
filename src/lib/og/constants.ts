// Share image format (FR-10.3), kept apart from render.tsx so page metadata
// can use it without loading the renderer and its fonts.
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };
export const SHARE_IMAGE_TYPE = "image/png";

// The site-wide image, served by src/app/opengraph-image.tsx.
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  alt: "Favour Michael, software engineer",
};
