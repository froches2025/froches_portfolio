import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionNav } from "@/components/public/section-nav";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let trigger: Callback = () => {};

class FakeIntersectionObserver {
  constructor(callback: Callback) {
    trigger = callback;
  }
  observe() {}
  disconnect() {}
}

const sections = [
  { id: "about", label: "About" },
  { id: "work", label: "Selected work" },
  { id: "experience", label: "Experience" },
] as const;

function enter(id: string, isIntersecting = true) {
  act(() =>
    trigger([{ target: document.getElementById(id)!, isIntersecting }]),
  );
}

describe("SectionNav", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    for (const { id } of sections) {
      const element = document.createElement("section");
      element.id = id;
      document.body.append(element);
    }
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  const current = () =>
    screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "location");

  it("marks the first section as current before anything scrolls", () => {
    render(<SectionNav sections={sections} />);
    expect(current().map((link) => link.textContent)).toEqual(["About"]);
  });

  it("highlights the section in view", () => {
    render(<SectionNav sections={sections} />);
    enter("about", false);
    enter("work");
    expect(current().map((link) => link.textContent)).toEqual([
      "Selected work",
    ]);
  });

  it("follows the reader as sections change", () => {
    render(<SectionNav sections={sections} />);
    enter("work");
    enter("work", false);
    enter("experience");
    expect(current().map((link) => link.textContent)).toEqual(["Experience"]);
  });

  it("links each item to its section", () => {
    render(<SectionNav sections={sections} />);
    expect(screen.getByRole("link", { name: "Selected work" })).toHaveProperty(
      "hash",
      "#work",
    );
  });

  it("renders nothing without sections", () => {
    const { container } = render(<SectionNav sections={[]} />);
    expect(container.innerHTML).toBe("");
  });
});
