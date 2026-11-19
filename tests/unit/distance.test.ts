// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/distance/route";
import {
  distanceFromHeaders,
  distanceKm,
  KIGALI,
  roundDistance,
  distanceState,
} from "@/lib/geo/distance";

const LAGOS = { latitude: 6.5244, longitude: 3.3792 };

describe("distance", () => {
  it("is zero from Kigali to itself", () => {
    expect(distanceKm(KIGALI)).toBe(0);
  });

  it("puts Lagos about 3,108 km from Kigali", () => {
    // Great-circle reference for these coordinates: 3,107.9 km.
    expect(distanceKm(LAGOS)).toBeCloseTo(3107.9, 0);
  });

  it("rounds to the nearest 10 km", () => {
    expect(roundDistance(3064.4)).toBe(3060);
    expect(roundDistance(3065)).toBe(3070);
  });

  it("names the far, near and unknown states around 50 km", () => {
    expect(distanceState(null)).toEqual({ kind: "unknown" });
    expect(distanceState(0)).toEqual({ kind: "near" });
    expect(distanceState(40)).toEqual({ kind: "near" });
    expect(distanceState(50)).toEqual({ kind: "far", km: 50 });
    expect(distanceState(3060)).toEqual({ kind: "far", km: 3060 });
  });
});

describe("distanceFromHeaders", () => {
  const headers = (latitude?: string, longitude?: string) => {
    const result = new Headers();
    if (latitude !== undefined) result.set("x-vercel-ip-latitude", latitude);
    if (longitude !== undefined) result.set("x-vercel-ip-longitude", longitude);
    return result;
  };

  it("is null without location headers", () => {
    expect(distanceFromHeaders(headers())).toBeNull();
    expect(distanceFromHeaders(headers("6.5244"))).toBeNull();
  });

  it("is null for values that are not coordinates", () => {
    expect(distanceFromHeaders(headers("north", "3.3792"))).toBeNull();
    expect(distanceFromHeaders(headers("95", "3.3792"))).toBeNull();
    expect(distanceFromHeaders(headers("", ""))).toBeNull();
  });

  it("returns a rounded distance for valid headers", () => {
    const km = distanceFromHeaders(headers("6.5244", "3.3792"));
    expect(km).not.toBeNull();
    expect((km ?? 1) % 10).toBe(0);
  });
});

describe("GET /api/distance", () => {
  it("returns null km and is never cached without headers", async () => {
    const response = GET(new Request("http://localhost/api/distance"));
    expect(await response.json()).toEqual({ km: null });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns a rounded number with Vercel's headers", async () => {
    const response = GET(
      new Request("http://localhost/api/distance", {
        headers: {
          "x-vercel-ip-latitude": "6.5244",
          "x-vercel-ip-longitude": "3.3792",
        },
      }),
    );
    const { km } = (await response.json()) as { km: number };
    expect(km).toBe(3110);
  });
});
