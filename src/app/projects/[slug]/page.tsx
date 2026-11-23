import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Entrance } from "@/components/motion/entrance";
import { Gallery } from "@/components/public/gallery";
import { SiteLink } from "@/components/public/site-link";
import { paragraphs, statusLabel } from "@/lib/content/format";
import {
  getProjectBySlug,
  getProjectSlugs,
  getPublishedProjects,
} from "@/lib/content/queries";
import { publicStorageUrl } from "@/lib/content/storage";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Project } from "@/lib/validation/content";

// The complete page must come from static output. For a slug that was not
// prerendered, Next.js waits for the page instead of streaming a fallback
// shell, so notFound() can still answer with a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Unknown slugs stop here, against the cached slug list, before any project
// query: random URLs never reach Supabase (NFR-4). Drafts are not in the list
// (RLS hides them), so they are 404 too (FR-2.5).
async function loadProject(slug: string): Promise<Project> {
  const slugs = await getProjectSlugs();
  if (!slugs.includes(slug)) notFound();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return project;
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const slugs = await getProjectSlugs();
  if (!slugs.includes(slug)) return {};
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.one_liner,
    path: `/projects/${project.slug}`,
    image: {
      url: `/projects/${project.slug}/share.png`,
      alt: `${project.title}: case study by Favour Michael`,
    },
  });
}

const SECTIONS = [
  ["problem_md", "Problem"],
  ["role_md", "My role"],
  ["approach_md", "Approach"],
  ["challenges_md", "Challenges"],
  ["outcome_md", "Outcome"],
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-5">
      <h2 className="mb-2.5 text-[22px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

// Case study (designs 05 and 06; FR-2.3 to 2.6). Empty sections are not rendered.
export default async function CaseStudyPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await loadProject(slug);
  const projects = await getPublishedProjects();
  const position = projects.findIndex((item) => item.slug === project.slug);
  const previous = position > 0 ? projects[position - 1] : null;
  const next = position < projects.length - 1 ? projects[position + 1] : null;

  const textSections = SECTIONS.flatMap(([field, title]) => {
    const text = project[field];
    return text ? [{ field, title, text }] : [];
  });

  const slides = project.project_images.map((image) => ({
    src: publicStorageUrl("project-images", image.storage_path),
    alt: image.alt,
    caption: image.caption,
    width: image.width,
    height: image.height,
  }));

  const stackSection =
    project.stack.length > 0 ? (
      <Section key="stack" title="Stack">
        <ul className="flex flex-wrap gap-2" aria-label="Stack">
          {project.stack.map((tag) => (
            <li
              key={tag}
              className="mi-chip rounded-full border border-line px-2.5 py-[5px] text-[13px] font-medium text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </Section>
    ) : null;

  // Text sections in order, with Stack placed after Approach as in the design
  // (or last when there is no Approach).
  const body: React.ReactNode[] = [];
  for (const section of textSections) {
    body.push(
      <Section key={section.field} title={section.title}>
        <div className="flex flex-col gap-3 text-[17px] leading-[1.6]">
          {paragraphs(section.text).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>,
    );
    if (section.field === "approach_md") body.push(stackSection);
  }
  if (!textSections.some((section) => section.field === "approach_md"))
    body.push(stackSection);

  return (
    <article className="mx-auto w-full max-w-[760px] px-5 pt-4 pb-6 lg:px-10 lg:pt-10">
      <Link
        href="/projects"
        className="mi-link inline-block py-2.5 text-base font-semibold text-muted"
      >
        All projects
      </Link>
      <Entrance>
        <h1 className="mt-2 text-5xl font-extrabold tracking-[-0.04em] lg:text-[64px]">
          {project.title}
        </h1>
      </Entrance>
      <Entrance order={1}>
        <p className="mt-3 text-[19px] leading-[1.45]">{project.tagline}</p>
      </Entrance>
      <Entrance order={2}>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <dt className="text-sm text-muted">Status</dt>
            <dd className="mt-0.5 text-base font-semibold">
              {statusLabel(project.status)}
            </dd>
          </div>
          {project.built_at ? (
            <div>
              <dt className="text-sm text-muted">Built at</dt>
              <dd className="mt-0.5 text-base font-semibold">
                {project.built_at}
              </dd>
            </div>
          ) : null}
        </dl>
      </Entrance>
      {project.live_url || project.repo_url ? (
        <Entrance order={3} className="mt-6 flex flex-col gap-3 sm:flex-row">
          {project.live_url ? (
            <SiteLink
              href={project.live_url}
              className="mi-btn flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-accent-fill px-6 text-[17px] font-bold text-on-accent"
            >
              {project.live_label ?? "Visit site"}
            </SiteLink>
          ) : null}
          {project.repo_url ? (
            <SiteLink
              href={project.repo_url}
              className="mi-btn flex h-[52px] items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-ink px-6 text-[17px] font-semibold"
            >
              {project.repo_label ?? "View code"}
            </SiteLink>
          ) : null}
        </Entrance>
      ) : null}

      {slides.length > 0 ? (
        <Gallery title={project.title} slides={slides} />
      ) : null}

      <div className="mt-10 flex flex-col gap-8">{body}</div>

      {previous || next ? (
        <nav
          aria-label="More projects"
          className="mt-10 grid gap-6 border-t border-line pt-5 sm:grid-cols-2"
        >
          {previous ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted">Previous project</span>
              <Link
                href={`/projects/${previous.slug}`}
                className="mi-link self-start text-2xl font-bold tracking-[-0.02em]"
              >
                {previous.title}
              </Link>
            </div>
          ) : null}
          {next ? (
            <div className="flex flex-col gap-1 sm:col-start-2 sm:text-right">
              <span className="text-sm text-muted">Next project</span>
              <Link
                href={`/projects/${next.slug}`}
                className="mi-link text-2xl font-bold tracking-[-0.02em] sm:self-end"
              >
                {next.title}
              </Link>
            </div>
          ) : null}
        </nav>
      ) : null}
    </article>
  );
}
