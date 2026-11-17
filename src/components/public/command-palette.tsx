"use client";

import { Command, useCommandState } from "cmdk";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Dialog } from "radix-ui";
import { CloseIcon } from "./icons";
import { usePalette } from "./palette-provider";

import type { PaletteItem } from "@/lib/content/site";

export type { PaletteItem };

// Announces how many results match, so screen-reader users hear the effect of typing.
function ResultCount() {
  const count = useCommandState((state) => state.filtered.count);
  return (
    <p role="status" className="sr-only">
      {count === 1 ? "1 result" : `${count} results`}
    </p>
  );
}

// FR-1.6, designs 11 and 12. A full-screen sheet on phones, a centred dialog
// on desktop. Radix traps focus, closes on Escape and returns focus to the
// control that opened it.
export function CommandPalette({ items }: { items: readonly PaletteItem[] }) {
  const { open, setOpen, restoreFocus } = usePalette();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function go(item: PaletteItem) {
    setOpen(false);
    if (item.href.startsWith("/")) {
      router.push(item.href);
    } else {
      window.location.assign(item.href);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/30 max-lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          // Radix would focus the Close button first; typing should go straight into search.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          // Radix would focus its own trigger, and this palette has several openers.
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
          className="fixed inset-0 z-50 flex flex-col bg-ground text-ink lg:inset-auto lg:top-[12vh] lg:left-1/2 lg:max-h-[76vh] lg:w-[min(560px,calc(100vw-48px))] lg:-translate-x-1/2 lg:rounded-2xl lg:border lg:border-line"
        >
          <div className="flex items-center justify-between px-5 py-3">
            <Dialog.Title className="text-[17px] font-bold">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="mi-btn flex size-11 items-center justify-center rounded-[12px] border border-line"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>

          <Command label="Jump to a page or action" loop className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-2 px-5 pt-2">
              <label htmlFor="palette-search" className="text-[15px] font-semibold">
                Jump to a page or action
              </label>
              <Command.Input
                ref={inputRef}
                id="palette-search"
                placeholder="Try “resume” or “AidReady”"
                className="h-[52px] rounded-[14px] border-[1.5px] border-line bg-surface px-4 text-[17px] text-ink placeholder:text-muted"
              />
            </div>
            <ResultCount />
            <Command.List className="mt-4 min-h-0 flex-1 overflow-y-auto px-5">
              <Command.Empty className="py-4 text-base text-muted">
                Nothing matches that. Try a project name or “resume”.
              </Command.Empty>
              {items.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label}
                  keywords={item.keywords ? [...item.keywords] : undefined}
                  onSelect={() => go(item)}
                  className="flex min-h-14 cursor-pointer items-center justify-between border-t border-line text-xl font-bold tracking-[-0.01em] data-[selected=true]:text-accent-text"
                >
                  <span>{item.label}</span>
                  <span className="text-sm font-normal text-muted">{item.kind}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>

          <p className="px-5 pt-4 pb-7 text-sm leading-normal text-muted">
            On a keyboard, press Ctrl K (Cmd K on Mac) from any page to open this.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
