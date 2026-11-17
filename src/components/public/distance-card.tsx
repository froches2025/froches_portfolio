"use client";

import { useEffect, useState } from "react";
import { shownDistance } from "@/lib/geo/distance";

// The live distance card (FR-3.3). The page itself stays pre-built; this asks
// /api/distance once, which reads Vercel's rough location and stores nothing.
// Without a usable distance (no location, or under 50 km) only the first
// sentence shows.
export function DistanceCard() {
  const [km, setKm] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/distance", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { km: null }))
      .then((body: { km: number | null }) => setKm(shownDistance(body.km)))
      .catch(() => setKm(null));
    return () => controller.abort();
  }, []);

  return (
    <li className="mi-card relative flex flex-col gap-3 overflow-hidden rounded-[20px] border border-line bg-surface p-5 lg:col-span-2 lg:p-6">
      <p className="text-[17px] leading-normal font-medium" aria-live="polite">
        {km === null ? (
          "I am from Nigeria and live in Kigali, Rwanda."
        ) : (
          <>
            I am from Nigeria and live in Kigali, Rwanda, about{" "}
            <strong>{km.toLocaleString("en-GB")} km</strong> from you.
          </>
        )}
      </p>
      {km === null ? null : (
        <p className="text-[13px] leading-normal text-muted">
          Worked out live from your rough location. Nothing is stored.
        </p>
      )}
    </li>
  );
}
