import { identity } from "@/data/identity";

const SOCIALS = [
  { label: "Email", href: `mailto:${identity.email}` },
  { label: "GitHub", href: identity.github },
  { label: "LinkedIn", href: identity.linkedin },
  { label: "X", href: identity.x },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest text-text-secondary">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="transition-colors hover:text-signal-amber"
            >
              {s.label}
            </a>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary/70">
          Built with Next.js · Deployed on Vercel
        </p>
      </div>
    </footer>
  );
}
