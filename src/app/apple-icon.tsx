import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same contour mark as icon.svg, rendered to PNG at build for iOS home screens.
// Token colours are written out because image generation cannot read CSS variables.
const GROUND = "#10201B";
const ACCENT = "#E9A93B";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: GROUND,
      }}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 64 64"
        fill="none"
        stroke={ACCENT}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          strokeWidth={3.2}
          d="M32 9c10 0 21 6 22 17 1 12-6 25-20 27S9 46 9 33 21 9 32 9z"
        />
        <path
          strokeWidth={3.2}
          d="M32 19c6 0 13 4 13 11s-4 15-12 15-14-5-14-12 6-14 13-14z"
        />
        <path
          strokeWidth={3.6}
          d="M32 28c3 0 5 2 5 4s-2 5-5 5-5-2-5-4 2-5 5-5z"
        />
      </svg>
    </div>,
    size,
  );
}
