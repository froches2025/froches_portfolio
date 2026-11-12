import Link from "next/link";
import { identity } from "@/data/identity";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";

const STATS = [
  {
    value: "20+",
    label: "Screens built",
    detail: "Next.js component library at Fluencer",
    anchor: "/about#fluencer-library",
  },
  {
    value: "Top 5",
    label: "Of 35 teams",
    detail: "AidReady, Frontiers GenAI Hackathon",
    anchor: "/projects/aidready",
  },
  {
    value: "4.37 / 5.0",
    label: "CGPA",
    detail: "BSc Software Engineering, ALU",
    anchor: "/about#education",
  },
  {
    value: "12",
    label: "Hackathon projects",
    detail: "Organised as Co-Lead, Claude Builders Club",
    anchor: "/about#leadership",
  },
];

export default function OverviewPage() {
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex min-h-[calc(100vh-4rem)] flex-col justify-center py-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-data-cyan">
          Software Engineer
        </p>
        <h1 className="mt-4 font-mono text-5xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-6xl md:text-7xl">
          {identity.name}
        </h1>
        <p className="mt-6 max-w-xl text-base text-text-secondary sm:text-lg">
          Frontend-focused software engineer building fast, reliable
          interfaces — from campus navigation to AI-powered products.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/projects"
            className="rounded-md bg-signal-amber px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-bg-void transition-opacity hover:opacity-90"
          >
            View Projects
          </Link>
          <a
            href={identity.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-text-primary transition-colors hover:border-signal-amber/60"
          >
            Résumé
          </a>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-line py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          Flight Record
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <Link
              key={stat.label}
              href={stat.anchor}
              className="group rounded-lg border border-line p-4 transition-colors hover:border-signal-amber/60"
            >
              <div className="font-mono text-2xl font-bold text-signal-amber sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-text-primary">{stat.label}</div>
              <div className="mt-0.5 text-[11px] text-text-secondary">
                {stat.detail}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured project */}
      <section className="border-t border-line py-14">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
            Selected Work
          </p>
          {rest.length === 0 && (
            <Link
              href="/projects"
              className="font-mono text-xs uppercase tracking-widest text-data-cyan hover:text-signal-amber"
            >
              More in progress →
            </Link>
          )}
        </div>
        {featured && (
          <div className="mt-6 max-w-xl">
            <ProjectCard project={featured} />
          </div>
        )}
      </section>
    </div>
  );
}
