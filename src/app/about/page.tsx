import type { Metadata } from "next";
import { experience } from "@/data/experience";
import { education, roles } from "@/data/education";
import { skills } from "@/data/skills";
import { identity } from "@/data/identity";

export const metadata: Metadata = {
  title: "About",
  description:
    "Background, experience, and skills for Favour Michael, software engineer.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-data-cyan">
        Section 03 / 03
      </p>
      <h1 className="mt-4 font-mono text-4xl font-bold text-text-primary sm:text-5xl">
        About
      </h1>

      <p className="mt-6 text-base leading-relaxed text-text-secondary">
        Software engineer with production frontend experience as the sole
        frontend developer on a paid AI video editing SaaS, plus full-stack
        projects in React, TypeScript, Python (FastAPI) and PostgreSQL. Ships
        and deploys AI-powered products for African users, from a
        load-balanced web app on two servers to an installable PWA with push
        reminders and LMS integration. Available for full-time, part-time,
        contract and internship roles.
      </p>

      {/* Experience */}
      <section className="mt-16">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          Experience
        </h2>
        <div className="mt-6 flex flex-col gap-10">
          {experience.map((entry) => (
            <div key={`${entry.org}-${entry.role}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-mono text-lg font-bold text-text-primary">
                  {entry.role} · {entry.org}
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
                  {entry.start} — {entry.end}
                  {entry.location && ` · ${entry.location}`}
                </span>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {entry.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    id={
                      entry.org === "Fluencer"
                        ? fluencerAnchor(bullet)
                        : undefined
                    }
                    className="flex gap-3 text-sm leading-relaxed text-text-secondary scroll-mt-24"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal-amber" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section id="education" className="mt-16 scroll-mt-24">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          Education
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          {education.map((entry) => (
            <div key={`${entry.org}-${entry.program}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-mono text-base font-bold text-text-primary">
                  {entry.program}
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">
                  {entry.start ? `${entry.start} — ${entry.end}` : entry.end}
                </span>
              </div>
              {entry.org && (
                <p className="mt-1 text-sm text-text-secondary">{entry.org}</p>
              )}
              {entry.detail && (
                <p className="mt-1 text-sm text-text-secondary">
                  {entry.detail}
                </p>
              )}
            </div>
          ))}
        </div>

        <div id="leadership" className="mt-8 flex scroll-mt-24 flex-col gap-3">
          {roles.map((role) => (
            <div key={`${role.org}-${role.role}`} className="text-sm">
              <span className="font-mono font-bold text-text-primary">
                {role.role}
              </span>
              <span className="text-text-secondary"> · {role.org}</span>
              {role.detail && (
                <p className="mt-1 text-text-secondary">{role.detail}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-16">
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          Skills
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {skills.map((group) => (
            <div key={group.category}>
              <h3 className="font-mono text-xs uppercase tracking-widest text-data-cyan">
                {group.category}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded border border-line px-2 py-0.5 font-mono text-[11px] text-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resume CTA */}
      <section className="mt-16 border-t border-line pt-10">
        <a
          href={identity.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-signal-amber px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-bg-void transition-opacity hover:opacity-90"
        >
          Download Résumé
        </a>
      </section>
    </div>
  );
}

function fluencerAnchor(bullet: string) {
  if (bullet.includes("20+ screens")) return "fluencer-library";
  return undefined;
}
