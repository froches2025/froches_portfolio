import { z } from "zod";

// Every database row is parsed here before a component sees it. The rules
// mirror the CHECK constraints in supabase/migrations, so a row that slips
// past one layer is still caught by the other (technical-design section 2).

const https = z.string().regex(/^https:\/\/.+/);

// Empty or whitespace-only text becomes null, so "section has content" is a
// plain null check and empty sections are never rendered (FR-2.3).
const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .nullable()
    .transform((value) => (value && value.trim() ? value : null));

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const isoDate = z.iso.date();

export const profileSchema = z.object({
  full_name: requiredText(80),
  headline: requiredText(120),
  location: optionalText(80),
  pitch: requiredText(240),
  availability: optionalText(160),
  bio_md: requiredText(4000),
  email: z.email(),
  github_url: https.nullable(),
  linkedin_url: https.nullable(),
  x_url: https.nullable(),
  resume_path: optionalText(500),
  resume_updated_at: z.string().nullable(),
  headshot_path: optionalText(500),
});
export type Profile = z.infer<typeof profileSchema>;

export const projectStatusSchema = z.enum([
  "live",
  "in_development",
  "archived",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectImageSchema = z.object({
  storage_path: requiredText(500),
  alt: requiredText(200),
  caption: optionalText(200),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sort_order: z.number().int(),
});
export type ProjectImage = z.infer<typeof projectImageSchema>;

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: requiredText(80),
  one_liner: requiredText(200),
  tagline: requiredText(80),
  highlight: optionalText(120),
  year: z.number().int().min(2015).max(2100),
  status: projectStatusSchema,
  live_url: https.nullable(),
  live_label: optionalText(40),
  repo_url: https.nullable(),
  repo_label: optionalText(40),
  built_at: optionalText(80),
  stack: z.array(z.string().min(1).max(30)).max(12),
  problem_md: optionalText(4000),
  role_md: optionalText(4000),
  approach_md: optionalText(4000),
  challenges_md: optionalText(4000),
  outcome_md: optionalText(4000),
  is_featured: z.boolean(),
  featured_order: z.number().int().min(1).max(4).nullable(),
  sort_order: z.number().int(),
  project_images: z
    .array(projectImageSchema)
    .default([])
    .transform((images) =>
      [...images].sort((a, b) => a.sort_order - b.sort_order),
    ),
});
export type Project = z.infer<typeof projectSchema>;

export const experienceSchema = z.object({
  role: requiredText(200),
  organisation: requiredText(200),
  org_url: https.nullable(),
  location: optionalText(200),
  engagement: optionalText(200),
  start_month: isoDate,
  end_month: isoDate.nullable(),
  bullets: z.array(z.string().min(1).max(300)).max(8),
  certificate_path: optionalText(500),
  sort_order: z.number().int(),
});
export type Experience = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  programme: requiredText(200),
  institution: requiredText(200),
  location: optionalText(200),
  period_label: requiredText(200),
  detail: optionalText(500),
  certificate_path: optionalText(500),
  sort_order: z.number().int(),
});
export type Education = z.infer<typeof educationSchema>;

export const roleSchema = z.object({
  title: requiredText(200),
  organisation: optionalText(200),
  start_month: isoDate,
  end_month: isoDate.nullable(),
  detail: optionalText(1000),
  sort_order: z.number().int(),
});
export type Role = z.infer<typeof roleSchema>;

export const skillGroupSchema = z.object({
  group_name: requiredText(100),
  items: z.array(z.string().min(1)),
  sort_order: z.number().int(),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

// https, or a site path whose second character is not / or \ (both open another site).
const factLink = z.string().regex(/^(https:\/\/.+|\/([^/\\].*)?)$/);

export const aboutFactSchema = z
  .object({
    title: requiredText(80),
    body_md: requiredText(600),
    link_url: factLink.nullable(),
    link_label: optionalText(40),
    doodle: z
      .enum(["trophy", "bolt", "checklist", "yarn", "pepper", "pot", "mic"])
      .nullable(),
    size: z.enum(["normal", "wide", "tall"]),
    sort_order: z.number().int(),
  })
  .refine((fact) => (fact.link_url === null) === (fact.link_label === null), {
    message: "link_url and link_label must be set together",
  });
export type AboutFact = z.infer<typeof aboutFactSchema>;

export function parseRows<T>(
  schema: z.ZodType<T>,
  rows: unknown,
  what: string,
): T[] {
  const result = z.array(schema).safeParse(rows);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(
      `Invalid ${what} row from Supabase at ${issue?.path.join(".")}: ${issue?.message}`,
    );
  }
  return result.data;
}
