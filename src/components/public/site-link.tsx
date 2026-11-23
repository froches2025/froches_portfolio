import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { isExternalLink } from "@/lib/content/format";
import { ExternalIcon } from "./icons";

type SiteLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "target" | "rel"> & {
  href: string;
};

// Every content link goes through here so the new-tab rule lives in one place:
// other sites open in a new tab and say so (icon plus hidden text, WCAG 3.2.5
// advisory); site pages, in-page anchors and mailto stay in the same tab.
export function SiteLink({ href, children, ...rest }: SiteLinkProps) {
  if (isExternalLink(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <ExternalIcon />{" "}
        {/* The space stays outside the span: one inside it is trimmed from
            the accessible name ("GitHub(opens..."). */}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
