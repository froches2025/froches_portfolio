import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Gallery, type GallerySlide } from "@/components/public/gallery";

// embla needs real layout, which jsdom lacks, so a stand-in API drives the
// component: these tests cover our buttons, keys, labels and position text.
let selected = 0;
const listeners = new Set<() => void>();
const scrollPrev = vi.fn<(jump?: boolean) => void>(() => move(-1));
const scrollNext = vi.fn<(jump?: boolean) => void>(() => move(1));
function move(step: number) {
  selected = (selected + step + slides.length) % slides.length;
  listeners.forEach((listener) => listener());
}
const api = {
  scrollPrev,
  scrollNext,
  selectedScrollSnap: () => selected,
  on: (_event: string, listener: () => void) => listeners.add(listener),
  off: (_event: string, listener: () => void) => listeners.delete(listener),
};
vi.mock("embla-carousel-react", () => ({ default: () => [() => {}, api] }));

let reduced = false;
vi.mock("@/components/motion/motion-preference", () => ({
  useReducedMotionPreference: () => reduced,
}));

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stand-in for next/image
    <img src={props.src} alt={props.alt} />
  ),
}));

const slides: GallerySlide[] = [
  {
    src: "/a.png",
    alt: "Voice assistant screen",
    caption: "The assistant guides first aid.",
    width: 10,
    height: 10,
  },
  {
    src: "/b.png",
    alt: "Help Finder map",
    caption: null,
    width: 10,
    height: 10,
  },
  {
    src: "/c.png",
    alt: "Hackathon demo",
    caption: "Built at the hackathon.",
    width: 10,
    height: 10,
  },
];

describe("Gallery", () => {
  beforeEach(() => {
    selected = 0;
    reduced = false;
    listeners.clear();
    scrollPrev.mockClear();
    scrollNext.mockClear();
  });
  afterEach(cleanup);

  it("is a labelled carousel with alt text on every slide", () => {
    render(<Gallery title="AidReady" slides={slides} />);
    expect(
      screen.getByRole("region", { name: "AidReady screenshots" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("img").map((image) => image.getAttribute("alt")),
    ).toEqual(slides.map((slide) => slide.alt));
    expect(screen.getByText("1 of 3")).toBeTruthy();
    expect(screen.getByText("The assistant guides first aid.")).toBeTruthy();
  });

  it("moves with the next and previous buttons and updates the caption", () => {
    render(<Gallery title="AidReady" slides={slides} />);
    fireEvent.click(screen.getByRole("button", { name: "Next screenshot" }));
    expect(screen.getByText("2 of 3")).toBeTruthy();
    expect(screen.queryByText("The assistant guides first aid.")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Previous screenshot" }),
    );
    expect(screen.getByText("1 of 3")).toBeTruthy();
  });

  it("moves with the arrow keys", () => {
    render(<Gallery title="AidReady" slides={slides} />);
    const region = screen.getByRole("region");
    act(() => {
      fireEvent.keyDown(region, { key: "ArrowRight" });
      fireEvent.keyDown(region, { key: "ArrowRight" });
    });
    expect(screen.getByText("3 of 3")).toBeTruthy();
    act(() => {
      fireEvent.keyDown(region, { key: "ArrowLeft" });
    });
    expect(screen.getByText("2 of 3")).toBeTruthy();
  });

  it("jumps without the scroll animation under reduced motion", () => {
    reduced = true;
    render(<Gallery title="AidReady" slides={slides} />);
    fireEvent.click(screen.getByRole("button", { name: "Next screenshot" }));
    expect(scrollNext).toHaveBeenCalledWith(true);
  });

  it("hides the controls for a single image", () => {
    render(<Gallery title="AidReady" slides={slides.slice(0, 1)} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
