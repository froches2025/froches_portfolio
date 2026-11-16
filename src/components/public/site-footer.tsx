export type SocialLinks = {
  github?: string;
  linkedin?: string;
  x?: string;
  email?: string;
};

const SOURCE_URL = "https://github.com/froches2025/froches_portfolio";

// FR-1.5. Links come from the profile (wired in step 4); each is hidden when absent.
export function SiteFooter({ links = {} }: { links?: SocialLinks }) {
  const items = [
    links.github ? { href: links.github, label: "GitHub" } : null,
    links.linkedin ? { href: links.linkedin, label: "LinkedIn" } : null,
    links.x ? { href: links.x, label: "X" } : null,
    links.email ? { href: `mailto:${links.email}`, label: "Email" } : null,
  ].filter((item) => item !== null);

  return (
    <footer className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 border-t border-line px-5 pt-8 pb-10 lg:px-10">
      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-5">
          {items.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="mi-link text-base font-semibold">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-sm leading-normal text-muted">
        Built with Next.js and Supabase.{" "}
        <a href={SOURCE_URL} className="underline underline-offset-2">
          Read the source on GitHub
        </a>
        .
      </p>
    </footer>
  );
}
