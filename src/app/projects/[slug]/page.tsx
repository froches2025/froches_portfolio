import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, GitFork } from "lucide-react";
import { projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.oneLiner,
  };
}

const STATUS_LABEL = {
  live: "LIVE",
  "in-development": "IN DEVELOPMENT",
  archived: "ARCHIVED",
} as const;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text-secondary transition-colors hover:text-signal-amber"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Projects
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-text-secondary">
          {project.status === "live" && (
            <span className="h-1.5 w-1.5 rounded-full bg-status-nominal" />
          )}
          {STATUS_LABEL[project.status]}
        </span>
        <span className="font-mono text-[10px] text-text-secondary">
          {project.year}
        </span>
      </div>

      <h1 className="mt-3 font-mono text-4xl font-bold text-text-primary sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-3 text-lg text-text-secondary">{project.oneLiner}</p>

      {project.images.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-lg border border-line">
          <Image
            src={project.images[0].src}
            alt={project.images[0].alt}
            width={1200}
            height={675}
            className="h-auto w-full"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-text-secondary"
          >
            {s}
          </span>
        ))}
      </div>

      <p className="mt-8 text-base leading-relaxed text-text-primary">
        {project.description}
      </p>

      {(project.liveUrl || project.repoUrl) && (
        <div className="mt-8 flex flex-wrap gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-signal-amber/60 bg-signal-amber/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-signal-amber transition-colors hover:bg-signal-amber/20"
            >
              Live Site <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-text-primary transition-colors hover:border-signal-amber/60"
            >
              Repo <GitFork className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
