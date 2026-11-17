import Image from "next/image";
import Link from "next/link";
import { statusLabel } from "@/lib/content/format";
import { publicStorageUrl } from "@/lib/content/storage";
import type { Project } from "@/lib/validation/content";
import { PlaceholderFrame } from "./placeholder-frame";
import { ProjectLinks } from "./project-links";

// Designs 01, 03 and 13. Phone stacks the cover above the text; desktop puts
// a smaller cover beside it. Headings are h3 inside a section's h2.
export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const cover = project.project_images[0];
  const href = `/projects/${project.slug}`;

  return (
    <article className="mi-card flex flex-col gap-3.5 border-t border-line py-7 lg:grid lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)] lg:gap-6">
      {cover ? (
        <Image
          src={publicStorageUrl("project-images", cover.storage_path)}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          priority={priority}
          sizes="(min-width: 1024px) 200px, 100vw"
          className="h-[196px] w-full rounded-[16px] object-cover lg:h-32 lg:rounded-[12px]"
        />
      ) : (
        <PlaceholderFrame className="h-[196px] lg:h-32 lg:rounded-[12px]" />
      )}

      <div className="flex flex-col gap-3.5 lg:gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-2xl font-bold tracking-[-0.02em] lg:text-lg">
            <Link href={href}>{project.title}</Link>
          </h3>
          <span className="text-sm whitespace-nowrap text-muted lg:text-xs">
            {statusLabel(project.status)}
          </span>
        </div>
        <p className="text-[17px] leading-normal lg:text-[15px]">{project.tagline}</p>
        {project.highlight ? (
          <p className="text-[15px] leading-[1.45] font-semibold text-accent-text lg:text-sm">
            {project.highlight}
          </p>
        ) : null}
        {project.stack.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Stack">
            {project.stack.map((tag) => (
              <li
                key={tag}
                className="mi-chip rounded-full border border-line px-2.5 py-[5px] text-[13px] font-medium text-muted lg:text-xs"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-4">
          <Link href={href} className="mi-link text-base font-bold" aria-label={`Read case study: ${project.title}`}>
            Read case study
          </Link>
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}
