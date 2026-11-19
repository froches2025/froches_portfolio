import type { Profile, Project } from "@/lib/validation/content";

export type PaletteItem = {
  label: string;
  kind: "Page" | "Project" | "Action" | "Link";
  href: string;
  keywords?: readonly string[];
};

export type SocialLinks = {
  github?: string;
  linkedin?: string;
  x?: string;
  email?: string;
};

export const RESUME_HREF = "/resume";

export function hasResume(profile: Profile): boolean {
  return profile.resume_path !== null;
}

// Only links the profile actually has; a missing one is hidden, never faked.
export function socialLinks(profile: Profile): SocialLinks {
  return {
    ...(profile.github_url ? { github: profile.github_url } : {}),
    ...(profile.linkedin_url ? { linkedin: profile.linkedin_url } : {}),
    ...(profile.x_url ? { x: profile.x_url } : {}),
    email: profile.email,
  };
}

// The command palette's entries (design 11): pages, each case study, then
// actions and links that exist.
export function paletteItems(
  profile: Profile,
  projects: readonly Project[],
): PaletteItem[] {
  const items: PaletteItem[] = [
    { label: "Home", kind: "Page", href: "/" },
    { label: "Projects", kind: "Page", href: "/projects" },
    { label: "About", kind: "Page", href: "/about" },
    ...projects.map((project): PaletteItem => ({
      label: `${project.title} case study`,
      kind: "Project",
      href: `/projects/${project.slug}`,
      keywords: [project.title, ...project.stack],
    })),
  ];
  if (hasResume(profile)) {
    items.push({
      label: "Download resume",
      kind: "Action",
      href: RESUME_HREF,
      keywords: ["cv"],
    });
  }
  items.push({
    label: "Email Favour",
    kind: "Action",
    href: `mailto:${profile.email}`,
    keywords: ["contact"],
  });
  if (profile.github_url)
    items.push({ label: "GitHub", kind: "Link", href: profile.github_url });
  if (profile.linkedin_url)
    items.push({ label: "LinkedIn", kind: "Link", href: profile.linkedin_url });
  if (profile.x_url)
    items.push({
      label: "X",
      kind: "Link",
      href: profile.x_url,
      keywords: ["twitter"],
    });
  return items;
}
