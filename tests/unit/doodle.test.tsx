import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Doodle } from "@/components/motion/doodle";
import {
  DOODLES,
  PIN_DOODLE,
  type DoodleKind,
} from "@/components/motion/doodle-data";

const KINDS = Object.keys(DOODLES) as DoodleKind[];

describe("Doodle", () => {
  afterEach(cleanup);

  it("has the seven doodles from the About design", () => {
    expect(KINDS).toEqual([
      "trophy",
      "bolt",
      "checklist",
      "yarn",
      "pepper",
      "pot",
      "mic",
    ]);
  });

  it.each(KINDS)(
    "draws %s as decoration, hidden from screen readers",
    (kind) => {
      const { container } = render(<Doodle kind={kind} />);
      const svg = container.querySelector("svg")!;
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      expect(svg.classList.contains("doodle")).toBe(true);
      expect(svg.style.getPropertyValue("--r")).toBe(
        `${DOODLES[kind].tilt}deg`,
      );
      expect(svg.children).toHaveLength(DOODLES[kind].shapes.length);
    },
  );

  it("draws the distance card's pin, which fact cards cannot pick", () => {
    const { container } = render(<Doodle kind="pin" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.children).toHaveLength(PIN_DOODLE.shapes.length);
    expect(KINDS).not.toContain("pin");
  });
});
