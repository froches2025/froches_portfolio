import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicSupabase } from "@/lib/supabase/server";
import {
  aboutFactSchema,
  educationSchema,
  experienceSchema,
  parseRows,
  profileSchema,
  projectSchema,
  roleSchema,
  skillGroupSchema,
  type AboutFact,
  type Education,
  type Experience,
  type Profile,
  type Project,
  type Role,
  type SkillGroup,
} from "@/lib/validation/content";
import { TAGS } from "./tags";

// Every query runs at build time and is cached until its tag is revalidated,
// so visitors never cause a database call (NFR-4). A query error throws:
// a failed build is better than a page that silently lost its content.

const PROFILE_COLUMNS =
  "full_name, headline, location, pitch, availability, bio_md, email, github_url, linkedin_url, x_url, resume_path, resume_updated_at, headshot_path";

const PROJECT_COLUMNS =
  "slug, title, one_liner, tagline, highlight, year, status, live_url, live_label, repo_url, repo_label, built_at, stack, problem_md, role_md, approach_md, challenges_md, outcome_md, is_featured, featured_order, sort_order, project_images(storage_path, alt, caption, width, height, sort_order)";

function fail(what: string, message: string): never {
  throw new Error(`Could not read ${what} from Supabase: ${message}`);
}

export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.profile);

  const { data, error } = await createPublicSupabase()
    .from("profile")
    .select(PROFILE_COLUMNS)
    .limit(1);
  if (error) fail("profile", error.message);
  const [profile] = parseRows(profileSchema, data, "profile");
  if (!profile) fail("profile", "no profile row");
  return profile;
}

export async function getPublishedProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects);

  const { data, error } = await createPublicSupabase()
    .from("projects")
    .select(PROJECT_COLUMNS)
    // RLS already hides drafts from the publishable key; this states the intent.
    .eq("is_published", true)
    .order("sort_order");
  if (error) fail("projects", error.message);
  return parseRows(projectSchema, data, "project");
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getPublishedProjects();
  return projects
    .filter((project) => project.is_featured)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0));
}

// Unknown slugs are rejected against this list before any project query, so
// random URLs never reach Supabase. Slice 1b revalidates the projects tag on publish.
export async function getProjectSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects);

  const projects = await getPublishedProjects();
  return projects.map((project) => project.slug);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.projects, TAGS.project(slug));

  const projects = await getPublishedProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export type AboutContent = {
  experience: Experience[];
  education: Education[];
  roles: Role[];
  skills: SkillGroup[];
  facts: AboutFact[];
};

export async function getAbout(): Promise<AboutContent> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.about);

  const supabase = createPublicSupabase();
  const [experience, education, roles, skills, facts] = await Promise.all([
    supabase
      .from("experience")
      .select(
        "role, organisation, org_url, location, engagement, start_month, end_month, bullets, certificate_path, sort_order",
      )
      .order("sort_order"),
    supabase
      .from("education")
      .select(
        "programme, institution, location, period_label, detail, certificate_path, sort_order",
      )
      .order("sort_order"),
    supabase
      .from("roles")
      .select("title, organisation, start_month, end_month, detail, sort_order")
      .order("sort_order"),
    supabase
      .from("skills")
      .select("group_name, items, sort_order")
      .order("sort_order"),
    supabase
      .from("about_facts")
      .select("title, body_md, link_url, link_label, doodle, size, sort_order")
      .order("sort_order"),
  ]);

  for (const [what, result] of Object.entries({
    experience,
    education,
    roles,
    skills,
    facts,
  })) {
    if (result.error) fail(what, result.error.message);
  }

  return {
    experience: parseRows(experienceSchema, experience.data, "experience"),
    education: parseRows(educationSchema, education.data, "education"),
    roles: parseRows(roleSchema, roles.data, "role"),
    skills: parseRows(skillGroupSchema, skills.data, "skill group"),
    facts: parseRows(aboutFactSchema, facts.data, "about fact"),
  };
}
