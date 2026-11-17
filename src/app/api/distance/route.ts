import { distanceFromHeaders } from "@/lib/geo/distance";

// FR-3.3: how far Kigali is from the visitor, from Vercel's rough-location
// headers. Returns a rounded number and stores and logs nothing. Each answer
// is private to one visitor, so it is never cached.
export function GET(request: Request) {
  return Response.json(
    { km: distanceFromHeaders(request.headers) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
