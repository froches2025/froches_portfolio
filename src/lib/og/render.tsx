import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  CONTOUR_PATHS,
  CONTOUR_VIEWBOX,
} from "@/components/motion/contour-paths";
import { SHARE_IMAGE_SIZE } from "./constants";

// Share images (FR-10.3), drawn at build in the Contour lines style. Colours
// are the dark theme's tokens written out, because image generation cannot
// read CSS variables (the same exception as the icons).
const GROUND = "#10201B";
const INK = "#E8EEE9";
const MUTED = "#A3B5AD";
const ACCENT = "#F2B544";
const CONTOUR = "#2D4B42";

export { SHARE_IMAGE_SIZE, SHARE_IMAGE_TYPE } from "./constants";

// Static Schibsted Grotesk weights (SIL OFL, see fonts/OFL.txt): the renderer
// needs TTF files, and committing them keeps the build off the network.
// Read once at module load, as in the installed opengraph-image guide: file
// reads during a render count as uncached I/O under Cache Components and
// would make the image route dynamic instead of prerendered.
async function loadFonts() {
  const dir = join(process.cwd(), "src/lib/og/fonts");
  const [medium, extraBold] = await Promise.all([
    readFile(join(dir, "SchibstedGrotesk-500.ttf")),
    readFile(join(dir, "SchibstedGrotesk-800.ttf")),
  ]);
  return [
    {
      name: "Schibsted Grotesk",
      data: medium,
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Schibsted Grotesk",
      data: extraBold,
      weight: 800 as const,
      style: "normal" as const,
    },
  ];
}

const fonts = loadFonts();

export async function renderShareImage({
  title,
  subtitle,
  footer,
}: {
  title: string;
  subtitle: string;
  footer?: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: GROUND,
        fontFamily: "Schibsted Grotesk",
        padding: "88px 88px 80px",
      }}
    >
      <svg
        width="640"
        height="900"
        viewBox={CONTOUR_VIEWBOX}
        fill="none"
        stroke={CONTOUR}
        strokeWidth={1.6}
        style={{ position: "absolute", top: -150, right: -60 }}
      >
        {CONTOUR_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 820,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              width: 72,
              height: 6,
              borderRadius: 3,
              background: ACCENT,
            }}
          />
          <div
            style={{
              fontSize: title.length > 18 ? 84 : 104,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              color: INK,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              lineHeight: 1.35,
              color: MUTED,
            }}
          >
            {subtitle}
          </div>
        </div>
        {footer ? (
          <div style={{ fontSize: 28, fontWeight: 500, color: MUTED }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    { ...SHARE_IMAGE_SIZE, fonts: await fonts },
  );
}
