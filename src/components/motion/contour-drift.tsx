"use client";

import { useScroll } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { contourDrift } from "./presets";
import { useReducedMotionPreference } from "./motion-preference";

function interpolate(
  value: number,
  [inStart, inEnd]: readonly [number, number],
  [outStart, outEnd]: readonly [number, number],
) {
  const progress = Math.min(
    Math.max((value - inStart) / (inEnd - inStart), 0),
    1,
  );
  return outStart + (outEnd - outStart) * progress;
}

// Moves its children with the page scroll (transform only, FR-1.7). motion
// tracks the scroll; the transform is written straight to the element, which
// avoids loading motion's component and animation features for two numbers.
// The SVG itself is rendered on the server and passed in, so its path data
// stays out of the JS bundle.
export function ContourDrift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotionPreference();
  const { scrollY } = useScroll();
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    if (reduced) {
      node.style.transform = "";
      return;
    }
    const apply = (scroll: number) => {
      const x = interpolate(scroll, contourDrift.scrollRange, contourDrift.x);
      const y = interpolate(scroll, contourDrift.scrollRange, contourDrift.y);
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    apply(scrollY.get());
    return scrollY.on("change", apply);
  }, [reduced, scrollY]);

  return (
    <div
      ref={element}
      className={className}
      data-contour-drift={reduced ? undefined : ""}
    >
      {children}
    </div>
  );
}
