import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/public/site-footer";

describe("SiteFooter", () => {
  afterEach(cleanup);

  it("shows only the source line without profile links", () => {
    render(<SiteFooter />);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(
      ["Read the source on GitHub"],
    );
  });

  it("shows each link it is given, and email as mailto", () => {
    render(
      <SiteFooter
        links={{
          github: "https://github.com/froches2025",
          email: "f.michael@alustudent.com",
        }}
      />,
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveProperty(
      "href",
      "https://github.com/froches2025",
    );
    expect(screen.getByRole("link", { name: "Email" })).toHaveProperty(
      "href",
      "mailto:f.michael@alustudent.com",
    );
    expect(screen.queryByRole("link", { name: "LinkedIn" })).toBeNull();
    expect(screen.queryByRole("link", { name: "X" })).toBeNull();
  });
});
