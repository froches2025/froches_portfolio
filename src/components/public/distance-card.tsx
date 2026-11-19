"use client";

import { useEffect, useState } from "react";
import { Doodle } from "@/components/motion/doodle";
import { distanceState, type DistanceState } from "@/lib/geo/distance";

const FROM = "I am from Nigeria and live in Kigali, Rwanda";
const PRIVACY = "Worked out live from your rough location. Nothing is stored.";
// Sizes the hidden far layer before a real distance arrives; the longest
// rounded great-circle distance on Earth is just over 20,000 km.
const WIDEST_KM = 20_000;

function Far({ km }: { km: number }) {
  return (
    <>
      <p className="text-[17px] leading-normal font-medium">
        {FROM}, about <strong>{km.toLocaleString("en-GB")} km</strong> from
        you.
      </p>
      <p className="text-[13px] leading-normal text-muted">{PRIVACY}</p>
    </>
  );
}

function Near() {
  return (
    <>
      <p className="text-[17px] leading-normal font-medium">
        {FROM}, which makes us practically neighbours.
      </p>
      <p className="text-[13px] leading-normal text-muted">{PRIVACY}</p>
    </>
  );
}

function Unknown() {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[26px] leading-tight font-extrabold tracking-[-0.02em] lg:text-[30px]">
        {FROM}.
      </p>
      <Doodle kind="pin" className="shrink-0" />
    </div>
  );
}

// The live distance card (FR-3.3). The page itself stays pre-built; this asks
// /api/distance once, which reads Vercel's rough location and stores nothing.
//
// All three states sit in the same grid cell and only the current one is
// visible, so the card is always as tall as its tallest state and never
// changes size when the answer arrives (no layout shift). It starts as
// "unknown", which is also what shows without JavaScript.
export function DistanceCard() {
  const [state, setState] = useState<DistanceState>({ kind: "unknown" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/distance", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { km: null }))
      .then((body: { km: number | null }) => setState(distanceState(body.km)))
      .catch(() => setState({ kind: "unknown" }));
    return () => controller.abort();
  }, []);

  const layers = {
    far: <Far km={state.kind === "far" ? state.km : WIDEST_KM} />,
    near: <Near />,
    unknown: <Unknown />,
  };

  return (
    <li
      data-state={state.kind}
      className="mi-card relative overflow-hidden rounded-[20px] border border-line bg-surface p-5 lg:col-span-2 lg:p-6"
    >
      <div className="grid" aria-live="polite">
        {(Object.keys(layers) as DistanceState["kind"][]).map((kind) => {
          const active = kind === state.kind;
          return (
            <div
              key={kind}
              data-layer={kind}
              aria-hidden={active ? undefined : true}
              className={[
                "col-start-1 row-start-1 flex flex-col justify-center gap-3",
                active ? "" : "invisible",
              ].join(" ")}
            >
              {layers[kind]}
            </div>
          );
        })}
      </div>
    </li>
  );
}
