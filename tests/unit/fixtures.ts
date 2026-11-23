// Rows shaped like the seed, for schema and query tests.
export const profileRow = {
  full_name: "Favour Michael",
  headline: "Software engineer",
  location: "Kigali, Rwanda",
  pitch: "I build and ship AI-powered products for African users.",
  availability: "Open to internships.",
  bio_md: "First paragraph.\n\nSecond paragraph.",
  email: "f.michael@alustudent.com",
  github_url: "https://github.com/froches2025",
  linkedin_url: "https://www.linkedin.com/in/froches",
  x_url: "https://x.com/froches_",
  resume_path: null,
  resume_updated_at: null,
  headshot_path: null,
};

export function projectRow(overrides: Record<string, unknown> = {}) {
  return {
    slug: "aidready",
    title: "AidReady",
    one_liner: "Built a voice-first emergency first-aid web app.",
    tagline: "Voice-first emergency first-aid web app.",
    highlight: "Top 5 of 35 teams",
    year: 2026,
    status: "live",
    live_url: "https://aidready-finder.froches.tech",
    live_label: "Visit Help Finder",
    repo_url: null,
    repo_label: null,
    built_at: "Frontiers GenAI Hackathon",
    stack: ["React", "HAProxy"],
    problem_md: null,
    role_md: "I built it.",
    approach_md: "   ",
    challenges_md: "",
    outcome_md: "Top 5.",
    is_featured: true,
    featured_order: 1,
    sort_order: 1,
    project_images: [],
    ...overrides,
  };
}
