import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DistanceCard } from "@/components/public/distance-card";

const PRIVACY = "Worked out live from your rough location. Nothing is stored.";

function respondWith(km: number | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ km }))),
  );
}

// The card stacks every state and hides all but one, so assertions read the
// visible layer only.
function visible(container: HTMLElement) {
  const card = container.querySelector("li")!;
  const layer = card.querySelector(
    `[data-layer="${card.dataset.state}"]`,
  ) as HTMLElement;
  return { card, layer, text: layer.textContent };
}

async function renderSettled(km: number | null, state: string) {
  respondWith(km);
  const { container } = render(<DistanceCard />);
  await waitFor(() =>
    expect(container.querySelector("li")!.dataset.state).toBe(state),
  );
  await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());
  return visible(container);
}

describe("DistanceCard", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the distance and the privacy line at 50 km or more", async () => {
    const { layer, text } = await renderSettled(3110, "far");
    expect(text).toBe(
      `I am from Nigeria and live in Kigali, Rwanda, about 3,110 km from you.${PRIVACY}`,
    );
    expect(layer.querySelector("strong")!.textContent).toBe("3,110 km");
  });

  it("says neighbours, with the privacy line, under 50 km", async () => {
    const { text } = await renderSettled(40, "near");
    expect(text).toBe(
      `I am from Nigeria and live in Kigali, Rwanda, which makes us practically neighbours.${PRIVACY}`,
    );
  });

  it("shows only the first sentence and a doodle when km is null", async () => {
    const { layer, text } = await renderSettled(null, "unknown");
    expect(text).toBe("I am from Nigeria and live in Kigali, Rwanda.");
    expect(layer.querySelector('svg[data-doodle="pin"]')).not.toBeNull();
  });

  it("falls back to the first sentence when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    const { container } = render(<DistanceCard />);
    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());
    expect(visible(container).text).toBe(
      "I am from Nigeria and live in Kigali, Rwanda.",
    );
  });

  it.each([
    [3110, "far"],
    [40, "near"],
    [null, "unknown"],
  ] as const)(
    "keeps the same span and every layer when km is %s, so nothing shifts",
    async (km, state) => {
      const { card } = await renderSettled(km, state);
      expect(card.className).toContain("lg:col-span-2");
      const layers = [...card.querySelectorAll("[data-layer]")];
      expect(layers.map((layer) => layer.getAttribute("data-layer"))).toEqual([
        "far",
        "near",
        "unknown",
      ]);
      for (const layer of layers) {
        const active = layer.getAttribute("data-layer") === state;
        expect(layer.classList.contains("invisible")).toBe(!active);
        expect(layer.getAttribute("aria-hidden")).toBe(active ? null : "true");
      }
    },
  );
});
