import type { ReactNode } from "react";

// The About timeline (design 07): a line with a marigold dot per entry.
export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="ml-1.5">{children}</ol>;
}

export function TimelineItem({
  when,
  title,
  place,
  children,
}: {
  when: string;
  title: string;
  place?: string | null;
  children?: ReactNode;
}) {
  return (
    <li className="relative border-l-2 border-line pb-7 pl-7">
      <span aria-hidden="true" className="absolute top-1 -left-[7px] size-3 rounded-full bg-accent-fill" />
      <p className="text-sm text-muted">{when}</p>
      <h3 className="mt-1 mb-0.5 text-lg leading-[1.35] font-bold">{title}</h3>
      {place ? <p className="mb-2 text-[15px]">{place}</p> : null}
      {children}
    </li>
  );
}
