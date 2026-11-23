import type { Metadata } from "next";
import Link from "next/link";
import { ContourLines } from "@/components/motion/contour-lines";
import { Entrance } from "@/components/motion/entrance";

// No canonical: a missing page should not point search engines anywhere.
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page moved or never existed.",
};

// Designs 09 and 10. Copy from docs/design/source/NotFound.dc.html.
export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden">
      <ContourLines className="-top-24 -left-40" />
      <div className="mx-auto flex max-w-[640px] flex-col gap-4 px-5 pt-[200px] pb-6 lg:pt-40">
        <Entrance>
          <p className="text-[15px] font-semibold text-accent-text">
            Page not found
          </p>
        </Entrance>
        <Entrance order={1}>
          <h1 className="text-[40px] leading-[1.05] font-extrabold tracking-[-0.035em]">
            This page moved or never existed.
          </h1>
        </Entrance>
        <Entrance order={2}>
          <p className="text-[17px] leading-[1.55]">
            The site was rebuilt in November 2026, so an older link may point
            somewhere new.
          </p>
        </Entrance>
        <Entrance order={3} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/projects"
            className="mi-btn flex h-[52px] items-center justify-center rounded-[14px] bg-accent-fill px-6 text-[17px] font-bold text-on-accent"
          >
            Go to projects
          </Link>
          <Link
            href="/"
            className="mi-btn flex h-[52px] items-center justify-center rounded-[14px] border-[1.5px] border-ink px-6 text-[17px] font-semibold"
          >
            Go home
          </Link>
        </Entrance>
      </div>
    </div>
  );
}
