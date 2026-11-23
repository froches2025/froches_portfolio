// Kigali, Rwanda (FR-3.3).
export const KIGALI = { latitude: -1.9441, longitude: 30.0619 } as const;

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Great-circle distance (haversine), in km.
export function distanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number } = KIGALI,
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Rounded to the nearest 10 km: precise enough to be friendly, too coarse to
// say where someone is.
export function roundDistance(km: number): number {
  return Math.round(km / 10) * 10;
}

function parseCoordinate(value: string | null, limit: number): number | null {
  if (value === null || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

// Reads Vercel's rough-location headers (x-vercel-ip-latitude and -longitude).
export function distanceFromHeaders(headers: Headers): number | null {
  const latitude = parseCoordinate(headers.get("x-vercel-ip-latitude"), 90);
  const longitude = parseCoordinate(headers.get("x-vercel-ip-longitude"), 180);
  if (latitude === null || longitude === null) return null;
  return roundDistance(distanceKm({ latitude, longitude }));
}

// Under 50 km the visitor is in or near Kigali, and "about 10 km from you"
// says too much about where they are, so the card says "neighbours" instead.
export const MIN_SHOWN_KM = 50;

export type DistanceState =
  { kind: "far"; km: number } | { kind: "near" } | { kind: "unknown" };

export function distanceState(km: number | null): DistanceState {
  if (km === null || !Number.isFinite(km)) return { kind: "unknown" };
  return km >= MIN_SHOWN_KM ? { kind: "far", km } : { kind: "near" };
}
