import { ContourDrift } from "./contour-drift";
import { CONTOUR_PATHS, CONTOUR_VIEWBOX } from "./contour-paths";

// The topographic motif: one inline SVG, decorative only (FR-1.7). It fills
// its positioned parent and fades out towards the bottom and right edges, so
// it never ends in a hard line however tall the parent is. `className`
// offsets the drawing inside that area.
export function ContourLines({
  className,
  areaClassName = "inset-0",
}: {
  className?: string;
  /** Where the faded area sits relative to the parent; defaults to filling it. */
  areaClassName?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -z-10 overflow-hidden ${areaClassName} [mask-image:linear-gradient(to_bottom,black_55%,transparent),linear-gradient(to_right,black_60%,transparent)] [mask-composite:intersect]`}
    >
      <ContourDrift
        className={["absolute", className].filter(Boolean).join(" ")}
      >
        <svg
          focusable="false"
          viewBox={CONTOUR_VIEWBOX}
          width="640"
          height="900"
          fill="none"
          stroke="var(--contour)"
          strokeWidth={1.1}
          data-contours=""
          className="max-w-none"
        >
          {CONTOUR_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </ContourDrift>
    </div>
  );
}
