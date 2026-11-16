import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  CommandPalette,
  type PaletteItem,
} from "@/components/public/command-palette";
import {
  PaletteProvider,
  usePalette,
} from "@/components/public/palette-provider";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeAll(() => {
  // jsdom lacks these; cmdk calls them while it lays out results.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView ??= () => {};
});

const items: PaletteItem[] = [
  { label: "Home", kind: "Page", href: "/" },
  { label: "Projects", kind: "Page", href: "/projects" },
  { label: "About", kind: "Page", href: "/about" },
];

function Opener() {
  const { setOpen } = usePalette();
  return (
    <button type="button" onClick={() => setOpen(true)}>
      Open menu and search
    </button>
  );
}

function renderPalette() {
  return render(
    <PaletteProvider>
      <Opener />
      <CommandPalette items={items} />
    </PaletteProvider>,
  );
}

const pressShortcut = (init: KeyboardEventInit) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ...init }));
  });

describe("CommandPalette", () => {
  beforeEach(() => push.mockReset());
  afterEach(cleanup);

  it("opens on Ctrl K as a named dialog with search focused", () => {
    renderPalette();
    pressShortcut({ ctrlKey: true });
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("combobox", { name: "Jump to a page or action" }),
    );
  });

  it("opens on Cmd K too, and the shortcut closes it again", () => {
    renderPalette();
    pressShortcut({ metaKey: true });
    expect(screen.queryByRole("dialog")).toBeTruthy();
    pressShortcut({ metaKey: true });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ignores K without a modifier", () => {
    renderPalette();
    pressShortcut({});
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("filters as you type and announces the count", () => {
    renderPalette();
    pressShortcut({ ctrlKey: true });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "proj" },
    });
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["ProjectsPage"]);
    expect(screen.getByRole("status").textContent).toBe("1 result");
  });

  it("shows the empty state when nothing matches", () => {
    renderPalette();
    pressShortcut({ ctrlKey: true });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "zzz" },
    });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(
      screen.getByText("Nothing matches that. Try a project name or “resume”."),
    ).toBeTruthy();
  });

  it("navigates to the chosen page with Enter and closes", () => {
    renderPalette();
    pressShortcut({ ctrlKey: true });
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "about" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/about");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on Escape and returns focus to the opener", async () => {
    renderPalette();
    const opener = screen.getByRole("button", { name: "Open menu and search" });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    // Radix returns focus in a timeout after the dialog unmounts.
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
