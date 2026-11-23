import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/public/site-footer";

describe("SiteFooter", () => {
  afterEach(cleanup);

  it("shows the source and privacy links without profile links", () => {
    render(<SiteFooter />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Read the source on GitHub (opens in a new tab)",
      "Privacy",
    ]);
    expect(links[0].getAttribute("target")).toBe("_blank");
    // The privacy note is a site page, so it stays in the same tab (NFR-6).
    expect(links[1].getAttribute("href")).toBe("/privacy");
    expect(links[1].hasAttribute("target")).toBe(false);
  });

  it("shows each link it is given, and email as mailto in the same tab", () => {
    render(
      <SiteFooter
        links={{
          github: "https://github.com/froches2025",
          email: "someone@example.com",
        }}
      />,
    );
    const github = screen.getByRole("link", {
      name: "GitHub (opens in a new tab)",
    });
    expect(github).toHaveProperty("href", "https://github.com/froches2025");
    expect(github.getAttribute("target")).toBe("_blank");
    const email = screen.getByRole("link", { name: "Email" });
    expect(email).toHaveProperty("href", "mailto:someone@example.com");
    expect(email.hasAttribute("target")).toBe(false);
    expect(screen.queryByRole("link", { name: /LinkedIn/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /^X/ })).toBeNull();
  });
});
