import type { Metadata } from "next";
import Link from "next/link";
import { Entrance } from "@/components/motion/entrance";
import { ExperienceList } from "@/components/public/experience-list";
import { HomeLayout } from "@/components/public/home-layout";
import { ProjectCard } from "@/components/public/project-card";
import { SectionNav } from "@/components/public/section-nav";
import { SiteLink } from "@/components/public/site-link";
import { paragraphs } from "@/lib/content/format";
import {
  getAbout,
  getFeaturedProjects,
  getProfile,
} from "@/lib/content/queries";
import { hasResume, RESUME_HREF, socialLinks } from "@/lib/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "work", label: "Selected work" },
  { id: "experience", label: "Experience" },
] as const;

const primaryButton =
  "mi-btn flex h-[52px] items-center justify-center rounded-[14px] bg-accent-fill px-[22px] text-[17px] font-bold text-on-accent lg:h-12 lg:text-base";
const secondaryButton =
  "mi-btn flex h-[52px] items-center justify-center rounded-[14px] border-[1.5px] border-ink px-[22px] text-[17px] font-semibold lg:inline-flex lg:h-12 lg:text-base";

// Designs 01 (phone) and 13 (desktop) (FR-1.1, FR-1.2, FR-1.3).
export default async function HomePage() {
  const [profile, featured, about] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getAbout(),
  ]);
  const links = socialLinks(profile);
  const kicker = [profile.headline, profile.location]
    .filter(Boolean)
    .join(", ");

  const intro = (
    <>
      <Entrance>
        <p className="text-[15px] font-medium text-muted lg:text-base">
          {kicker}
        </p>
      </Entrance>
      <Entrance order={1}>
        <h1 className="text-[60px] leading-[0.92] font-extrabold tracking-[-0.04em] lg:text-[88px] lg:leading-[0.9] lg:tracking-[-0.045em] lg:short:text-[68px]">
          Favour
          <br />
          Michael
        </h1>
      </Entrance>
      <Entrance order={2} className="flex flex-col gap-5">
        <p className="text-[19px] leading-[1.45] lg:max-w-[420px] lg:text-xl">
          {profile.pitch}
        </p>
        {profile.availability ? (
          <p className="text-base leading-normal text-muted lg:hidden">
            {profile.availability}
          </p>
        ) : null}
      </Entrance>

      <SectionNav sections={SECTIONS} />

      <Entrance
        order={3}
        className="mt-2 flex flex-col gap-3 lg:mt-4 lg:flex-row lg:flex-wrap lg:short:mt-1"
      >
        <Link href="/projects" className={`${primaryButton} lg:hidden`}>
          View projects
        </Link>
        <a
          href="#work"
          className={`${primaryButton} max-lg:hidden lg:inline-flex`}
        >
          View projects
        </a>
        {hasResume(profile) ? (
          <a href={RESUME_HREF} className={secondaryButton}>
            Download resume
          </a>
        ) : null}
        <a
          href={`mailto:${profile.email}`}
          className="mi-link self-center p-3 text-base font-semibold text-accent-text lg:hidden"
        >
          Email {profile.email}
        </a>
      </Entrance>

      <ul
        data-home-socials=""
        className="mt-6 hidden flex-wrap gap-5 lg:flex lg:short:mt-2"
      >
        {(
          [
            ["GitHub", links.github],
            ["LinkedIn", links.linkedin],
            ["X", links.x],
            ["Email", `mailto:${profile.email}`],
          ] as const
        ).map(([label, href]) =>
          href ? (
            <li key={label}>
              <SiteLink
                href={href}
                className="mi-link inline-flex items-center gap-1.5 text-[15px] font-semibold"
              >
                {label}
              </SiteLink>
            </li>
          ) : null,
        )}
      </ul>
      <p className="mt-2 hidden text-sm text-muted lg:block lg:short:mt-0">
        Press Ctrl K to jump anywhere.
      </p>
    </>
  );

  return (
    <HomeLayout intro={intro}>
      <section
        id="about"
        aria-label="About"
        className="hidden max-w-[640px] scroll-mt-24 flex-col gap-4 text-lg leading-[1.65] lg:flex"
      >
        {paragraphs(profile.bio_md).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {profile.availability ? <p>{profile.availability}</p> : null}
      </section>

      {featured.length > 0 ? (
        <section
          id="work"
          aria-labelledby="work-heading"
          className="scroll-mt-24 pt-2 lg:mt-[72px] lg:pt-0"
        >
          <h2
            id="work-heading"
            className="mb-1 text-[30px] font-extrabold tracking-[-0.03em] lg:mb-2 lg:text-[32px]"
          >
            Selected work
          </h2>
          {/* Design copy names the count, so it only shows when it is true. */}
          {featured.length === 4 ? (
            <p className="mb-4 text-base text-muted lg:hidden">
              Four projects I would show you first.
            </p>
          ) : null}
          {featured.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              priority={index === 0}
            />
          ))}
          <Link
            href="/projects"
            className="mi-link mt-1 inline-block py-3 text-[17px] font-bold"
          >
            See all projects
          </Link>
        </section>
      ) : null}

      {about.experience.length > 0 ? (
        <section
          id="experience"
          aria-labelledby="experience-heading"
          className="mt-10 scroll-mt-24 lg:mt-[72px]"
        >
          <h2
            id="experience-heading"
            className="mb-2 text-[30px] font-extrabold tracking-[-0.03em] lg:text-[26px]"
          >
            <span className="lg:hidden">Where I have worked</span>
            <span className="max-lg:hidden">Experience</span>
          </h2>
          <ExperienceList items={about.experience} />
          <Link
            href="/about"
            className="mi-link inline-block py-3 text-[17px] font-bold"
          >
            More about me
          </Link>
        </section>
      ) : null}
    </HomeLayout>
  );
}
