// Shared timing for JS-driven motion, matching the CSS micro-interactions.
export const ease = {
  out: [0.2, 0.8, 0.2, 1] as const,
};

export const duration = {
  fast: 0.18,
  base: 0.28,
  slow: 0.6,
} as const;

// How far the contour field drifts per 1,000 px scrolled. Small on purpose:
// the motif should move with the page, not pull attention from the text.
export const contourDrift = {
  scrollRange: [0, 1000] as const,
  x: [0, -14] as const,
  y: [0, 40] as const,
};
