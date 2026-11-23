// The seven fact-card doodles from docs/design/source/About.dc.html, in the
// order the design uses them: shapes inside a 56 by 56 viewBox, and each tilt.
type Shape =
  | { tag: "path"; d: string }
  | {
      tag: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
    }
  | { tag: "circle"; cx: number; cy: number; r: number };

export const DOODLES = {
  trophy: {
    tilt: -8,
    shapes: [
      { tag: "path", d: "M18 12h20v10a10 10 0 0 1-20 0z" },
      {
        tag: "path",
        d: "M18 15h-6a6 6 0 0 0 7 8M38 15h6a6 6 0 0 1-7 8M28 32v8M20 44h16",
      },
      { tag: "path", d: "M25 18l2 3 4-5" },
    ],
  },
  bolt: {
    tilt: 10,
    shapes: [
      { tag: "path", d: "M31 6L17 31h10l-3 19 15-27H29z" },
      { tag: "path", d: "M8 14l4 2M46 40l4 2M44 10l3-3" },
    ],
  },
  checklist: {
    tilt: -6,
    shapes: [
      { tag: "rect", x: 9, y: 11, width: 16, height: 16, rx: 3 },
      { tag: "path", d: "M13 19l3 3 6-7" },
      { tag: "path", d: "M31 15h16M31 21h10" },
      { tag: "rect", x: 9, y: 33, width: 16, height: 16, rx: 3 },
      { tag: "path", d: "M31 37h16M31 43h8" },
      { tag: "path", d: "M44 30v6M41 33h6" },
    ],
  },
  yarn: {
    tilt: 8,
    shapes: [
      { tag: "circle", cx: 24, cy: 30, r: 15 },
      {
        tag: "path",
        d: "M12 22c8 2 16 10 20 21M14 38c6-6 16-10 24-9M20 16c6 4 10 14 9 28",
      },
      { tag: "path", d: "M36 10l14 -6M44 8l-2 4" },
      { tag: "path", d: "M39 32c6 2 10 8 9 14" },
    ],
  },
  pepper: {
    tilt: -10,
    shapes: [
      {
        tag: "path",
        d: "M18 20c-6 10-4 26 12 30 12 3 18-6 10-12-8-6-6-16-12-20",
      },
      { tag: "path", d: "M24 18c2-6 8-8 12-6" },
      { tag: "path", d: "M33 12c1-4 4-6 7-6" },
      { tag: "path", d: "M46 20l4-2M48 28h4" },
    ],
  },
  pot: {
    tilt: 6,
    shapes: [
      {
        tag: "path",
        d: "M10 26h36v12a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z",
      },
      { tag: "path", d: "M6 26h44M24 20v-2M32 20v-2" },
      { tag: "path", d: "M20 12c-2-3 2-5 0-8M28 12c-2-3 2-5 0-8" },
      {
        tag: "path",
        d: "M38 6c2-2 5 0 4 3-1 2-4 4-4 4s-3-2-4-4c-1-3 2-5 4-3z",
      },
    ],
  },
  mic: {
    tilt: -4,
    shapes: [
      { tag: "rect", x: 21, y: 6, width: 14, height: 24, rx: 7 },
      { tag: "path", d: "M14 24a14 14 0 0 0 28 0M28 38v10M20 48h16" },
      { tag: "path", d: "M8 14c-3 4-3 10 0 14M48 14c3 4 3 10 0 14" },
    ],
  },
} as const satisfies Record<string, { tilt: number; shapes: readonly Shape[] }>;

export type DoodleKind = keyof typeof DOODLES;

// A map pin for the distance card only (FR-3.3). Kept out of DOODLES because
// that list is the set fact cards may pick, mirrored by the database check.
export const PIN_DOODLE = {
  tilt: 6,
  shapes: [
    {
      tag: "path",
      d: "M28 47s-13-12-13-23a13 13 0 0 1 26 0c0 11-13 23-13 23z",
    },
    { tag: "circle", cx: 28, cy: 24, r: 5 },
    { tag: "path", d: "M9 51h7M24 51h8M40 51h7" },
  ],
} as const satisfies { tilt: number; shapes: readonly Shape[] };
