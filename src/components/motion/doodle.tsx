import type { CSSProperties } from "react";
import { DOODLES, type DoodleKind } from "./doodle-data";

// A floating fact-card doodle (FR-1.8). Bobs gently and speeds up while its
// card is hovered or pressed; still under reduced motion and low-power mode.
export function Doodle({
  kind,
  className,
}: {
  kind: DoodleKind;
  className?: string;
}) {
  const { tilt, shapes } = DOODLES[kind];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      stroke="var(--accent-text)"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={["doodle", className].filter(Boolean).join(" ")}
      style={{ "--r": `${tilt}deg` } as CSSProperties}
      data-doodle={kind}
    >
      {shapes.map((shape, index) => {
        const { tag, ...attributes } = shape;
        if (tag === "path") return <path key={index} {...attributes} />;
        if (tag === "rect") return <rect key={index} {...attributes} />;
        return <circle key={index} {...attributes} />;
      })}
    </svg>
  );
}
