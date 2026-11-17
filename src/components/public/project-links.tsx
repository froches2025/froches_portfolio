import { ExternalIcon } from "./icons";
import type { Project } from "@/lib/validation/content";

// The live site and code links with the labels from the content, or a plain
// default when no label was written.
export function ProjectLinks({ project }: { project: Project }) {
  return (
    <>
      {project.live_url ? (
        <a
          href={project.live_url}
          className="mi-link inline-flex items-center gap-1.5 text-base font-semibold text-accent-text"
        >
          {project.live_label ?? "Visit site"}
          <ExternalIcon />
        </a>
      ) : null}
      {project.repo_url ? (
        <a
          href={project.repo_url}
          className="mi-link inline-flex items-center gap-1.5 text-base font-semibold text-accent-text"
        >
          {project.repo_label ?? "View code"}
          <ExternalIcon />
        </a>
      ) : null}
    </>
  );
}
