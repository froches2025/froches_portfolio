"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { PaletteItem } from "./command-palette";
import { usePalette } from "./palette-provider";

// cmdk and the dialog are only downloaded the first time the palette opens,
// so pages do not pay for them up front. The shortcut and buttons live in the
// small PaletteProvider and work from the first paint.
const CommandPalette = dynamic(
  () => import("./command-palette").then((module) => module.CommandPalette),
  { ssr: false },
);

export function LazyCommandPalette({ items }: { items: readonly PaletteItem[] }) {
  const { open } = usePalette();
  const [requested, setRequested] = useState(false);
  // Derived during render (not in an effect): once opened, keep it mounted.
  if (open && !requested) setRequested(true);
  return requested ? <CommandPalette items={items} /> : null;
}
