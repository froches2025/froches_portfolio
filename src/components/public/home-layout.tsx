import type { ReactNode } from "react";
import { ContourLines } from "@/components/motion/contour-lines";

// Home on desktop (design 13): a sticky left column with the hero and section
// nav beside the scrolling content. On phones the two stack. The column is as
// tall as its content (self-start), not the viewport, so sticky ends where the
// grid ends and the column never runs over the footer; on short windows the
// `short:` sizes keep the whole column inside the viewport.
export function HomeLayout({ intro, children }: { intro: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1240px] lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16 lg:px-12">
      <div
        data-home-column=""
        className="relative isolate px-5 pt-9 pb-12 lg:sticky lg:top-0 lg:self-start lg:px-0 lg:pt-24 lg:pb-16 lg:short:pt-10 lg:short:pb-8">
        {/* On desktop the field bleeds 160 px left of the column, as in design 13. */}
        <ContourLines
          areaClassName="inset-0 lg:-left-40"
          className="-top-10 -left-40 lg:left-0"
        />
        <div className="relative z-[1] flex flex-col gap-5 lg:gap-6 lg:short:gap-3.5">{intro}</div>
      </div>
      <div className="min-w-0 px-5 pb-16 lg:px-0 lg:pt-24 lg:short:pt-10">{children}</div>
    </div>
  );
}
