"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { identity } from "@/data/identity";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpenEvent = () => setOpen(true);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  const runAndClose = useCallback((fn: () => void) => {
    fn();
    setOpen(false);
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Jump to a page or reach Favour"
      className="border border-line bg-bg-panel font-mono"
    >
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty className="font-mono text-xs text-text-secondary">
          No results found.
        </CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runAndClose(() => router.push("/"))}>
            Go to Overview
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(() => router.push("/projects"))}>
            Go to Projects
          </CommandItem>
          <CommandItem onSelect={() => runAndClose(() => router.push("/about"))}>
            Go to About
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runAndClose(() => window.open(identity.resumeUrl, "_blank"))
            }
          >
            Download Résumé
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runAndClose(() => {
                window.location.href = `mailto:${identity.email}`;
              })
            }
          >
            Email Favour
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runAndClose(() => window.open(identity.github, "_blank"))
            }
          >
            Open GitHub
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runAndClose(() => window.open(identity.linkedin, "_blank"))
            }
          >
            Open LinkedIn
          </CommandItem>
          <CommandItem
            onSelect={() => runAndClose(() => window.open(identity.x, "_blank"))}
          >
            Open X
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
