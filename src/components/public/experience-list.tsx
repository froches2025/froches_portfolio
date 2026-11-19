import { formatMonthRange } from "@/lib/content/format";
import type { Experience } from "@/lib/validation/content";

// The short experience list on home (designs 01 and 13).
export function ExperienceList({ items }: { items: readonly Experience[] }) {
  return (
    <ol>
      {items.map((item) => (
        <li
          key={`${item.organisation}-${item.start_month}`}
          className="flex flex-col gap-1 border-t border-line py-[18px] lg:grid lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] lg:gap-6"
        >
          <span className="flex flex-col gap-1 lg:col-start-2 lg:row-start-1">
            <span className="text-[17px] leading-[1.35] font-bold lg:text-[15px]">
              {item.role}
              {item.engagement ? ` (${item.engagement})` : ""}
            </span>
            <span className="text-[15px] lg:text-sm">
              {item.organisation}
              {item.location === "Remote" ? ", remote" : ""}
            </span>
          </span>
          <span className="text-sm text-muted lg:col-start-1 lg:row-start-1 lg:text-xs lg:leading-6">
            {formatMonthRange(item.start_month, item.end_month)}
          </span>
        </li>
      ))}
    </ol>
  );
}
