"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "./icons";
import { usePalette } from "./palette-provider";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
] as const;

// Phone: name and menu button on every page. Desktop: name and links on every
// page except home, whose left column carries the name and section nav (design 13).
export function SiteHeader({ resumeHref }: { resumeHref?: string }) {
  const pathname = usePathname();
  const { setOpen } = usePalette();
  const isHome = pathname === "/";

  return (
    <header
      className={[
        "relative z-10 mx-auto flex w-full max-w-[1120px] items-center justify-between gap-6 px-5 py-3 lg:px-10 lg:py-5",
        isHome ? "lg:hidden" : "",
      ].join(" ")}
    >
      <Link href="/" className="text-[17px] font-bold tracking-[-0.01em] lg:text-lg">
        Favour Michael
      </Link>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu and search"
        className="mi-btn flex size-11 items-center justify-center rounded-[12px] border border-line lg:hidden"
      >
        <MenuIcon />
      </button>

      <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
        {NAV.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={[
                "mi-link text-[15px]",
                current ? "font-bold text-ink" : "font-medium text-muted",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
        {resumeHref ? (
          <a href={resumeHref} className="mi-link text-[15px] font-medium text-muted">
            Resume
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-[8px] border border-line px-2.5 py-1 text-[13px] text-muted"
        >
          {/* The name keeps the visible "Ctrl K" (WCAG 2.5.3, label in name). */}
          <span className="sr-only">Open quick search, </span>
          Ctrl K
        </button>
      </nav>
    </header>
  );
}
