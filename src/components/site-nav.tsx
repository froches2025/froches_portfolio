"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { identity } from "@/data/identity";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg-void/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-bold tracking-widest text-text-primary transition-colors hover:text-signal-amber"
        >
          FROCHES
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors",
                  active
                    ? "text-signal-amber"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-command-palette"))
            }
            className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-secondary transition-colors hover:border-signal-amber/60 hover:text-text-primary sm:flex"
          >
            <span>⌘K</span>
          </button>
          <a
            href={identity.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-signal-amber/60 bg-signal-amber/10 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-signal-amber transition-colors hover:bg-signal-amber/20"
          >
            Résumé
          </a>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="flex items-center justify-center rounded-md border border-line p-2 text-text-secondary transition-colors hover:text-text-primary md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-line bg-bg-panel text-text-primary"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-1 px-4 pt-12">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-3 font-mono text-sm uppercase tracking-widest text-text-secondary transition-colors hover:text-signal-amber"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
