// Cache tags (technical-design section 3). Slice 1b's admin actions call
// revalidateTag with these after a save, so only affected pages rebuild.
export const TAGS = {
  profile: "profile",
  projects: "projects",
  about: "about",
  project: (slug: string) => `project:${slug}`,
} as const;
