import type { Metadata } from "next";
import { Entrance } from "@/components/motion/entrance";
import { ProjectCard } from "@/components/public/project-card";
import { getPublishedProjects } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Projects · Favour Michael",
  description:
    "Projects Favour Michael has built and shipped, with case studies.",
  alternates: { canonical: "/projects" },
};

// Design 03 (FR-2.1): every published project in Favour's manual order.
export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 pt-4 pb-6 lg:px-10 lg:pt-14">
      <Entrance>
        <h1 className="text-5xl font-extrabold tracking-[-0.04em] lg:text-[64px]">
          Projects
        </h1>
      </Entrance>
      <Entrance order={1}>
        <p className="mt-3 mb-5 text-[17px] leading-normal text-muted">
          What I have built and shipped, in the order I would walk you through
          them.
        </p>
      </Entrance>
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
