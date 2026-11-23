import { Doodle } from "@/components/motion/doodle";
import { isExternalLink, paragraphs } from "@/lib/content/format";
import type { AboutFact } from "@/lib/validation/content";
import { SiteLink } from "./site-link";

const SIZE: Record<AboutFact["size"], string> = {
  normal: "",
  wide: "lg:col-span-2",
  tall: "lg:row-span-2",
};

// A fact card on About (FR-3.3, designs 07 and 14). Doodles float on cards
// that have one (FR-1.8).
export function FactCard({ fact }: { fact: AboutFact }) {
  return (
    <li
      className={[
        "mi-card relative flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-5 lg:gap-3 lg:p-6",
        // Room for the doodle; set at both sizes so lg:p-6 cannot override it.
        fact.doodle ? "pr-[84px] lg:pr-[88px]" : "",
        SIZE[fact.size],
      ].join(" ")}
    >
      {fact.doodle ? <Doodle kind={fact.doodle} className="absolute top-3.5 right-3.5" /> : null}
      <h3 className="text-[19px] leading-[1.3] font-bold lg:text-xl lg:leading-tight">{fact.title}</h3>
      {paragraphs(fact.body_md).map((paragraph) => (
        <p key={paragraph} className="text-base leading-[1.55]">
          {paragraph}
        </p>
      ))}
      {fact.link_url && fact.link_label ? (
        <SiteLink
          href={fact.link_url}
          className={
            isExternalLink(fact.link_url)
              ? "mi-link inline-flex items-center gap-1.5 self-start text-[15px] font-bold text-accent-text"
              : "mi-link self-start text-[15px] font-bold"
          }
        >
          {fact.link_label}
        </SiteLink>
      ) : null}
    </li>
  );
}
