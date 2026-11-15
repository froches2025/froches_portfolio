import { createHash, timingSafeEqual } from "node:crypto";

const BEARER = "Bearer ";

// Hashing first gives both sides the same length, so timingSafeEqual can run
// and the comparison time reveals neither the token nor its length.
function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function isAuthorizedCronRequest(
  authorization: string | null,
  secret: string,
): boolean {
  if (!secret || !authorization?.startsWith(BEARER)) {
    return false;
  }
  const token = authorization.slice(BEARER.length);
  return timingSafeEqual(digest(token), digest(secret));
}
