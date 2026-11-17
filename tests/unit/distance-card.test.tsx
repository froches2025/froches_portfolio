import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DistanceCard } from "@/components/public/distance-card";

function respondWith(km: number | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ km }))),
  );
}

describe("DistanceCard", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the distance and the privacy note", async () => {
    respondWith(3110);
    render(<DistanceCard />);
    await waitFor(() => expect(screen.getByText("3,110 km")).toBeTruthy());
    expect(
      screen.getByText(
        "Worked out live from your rough location. Nothing is stored.",
      ),
    ).toBeTruthy();
  });

  it.each([null, 40])(
    "shows only the first sentence when km is %s",
    async (km) => {
      respondWith(km);
      render(<DistanceCard />);
      await waitFor(() =>
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
          "/api/distance",
          expect.anything(),
        ),
      );
      expect(
        screen.getByText("I am from Nigeria and live in Kigali, Rwanda."),
      ).toBeTruthy();
      expect(screen.queryByText(/Nothing is stored/)).toBeNull();
    },
  );

  it("falls back when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    render(<DistanceCard />);
    expect(
      screen.getByText("I am from Nigeria and live in Kigali, Rwanda."),
    ).toBeTruthy();
  });
});
