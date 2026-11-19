import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteLink } from "@/components/public/site-link";

describe("SiteLink", () => {
  afterEach(cleanup);

  it("opens another site in a new tab and says so", () => {
    render(<SiteLink href="https://github.com/froches2025">GitHub</SiteLink>);
    const link = screen.getByRole("link", {
      name: "GitHub (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelector("svg[aria-hidden='true']")).not.toBeNull();
  });

  it.each(["/about", "#work", "mailto:someone@example.com"])(
    "keeps %s in the same tab, with no new-tab text or icon",
    (href) => {
      render(<SiteLink href={href}>Go</SiteLink>);
      const link = screen.getByRole("link", { name: "Go" });
      expect(link.getAttribute("href")).toBe(href);
      expect(link.hasAttribute("target")).toBe(false);
      expect(link.hasAttribute("rel")).toBe(false);
      expect(link.querySelector("svg")).toBeNull();
    },
  );

  it("passes class names and other attributes through", () => {
    render(
      <SiteLink href="https://example.com" className="mi-link" data-x="1">
        Example
      </SiteLink>,
    );
    const link = screen.getByRole("link", { name: /Example/ });
    expect(link.className).toBe("mi-link");
    expect(link.dataset.x).toBe("1");
  });
});
