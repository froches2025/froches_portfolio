import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "Projects",
  description: "Software engineering projects by Favour Michael.",
};

const STATUS_ORDER = { live: 0, "in-development": 1, archived: 2 };

export default function ProjectsPage() {
  const sorted = [...projects].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-data-cyan">
        Section 02 / 03
      </p>
      <h1 className="mt-4 font-mono text-4xl font-bold text-text-primary sm:text-5xl">
        Projects
      </h1>

      {sorted.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sorted.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-sm text-text-secondary">
          Projects are being added.
        </p>
      )}
    </div>
  );
}
